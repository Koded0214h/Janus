"""
AI Service for Janus Protocol with Google Gemini + Anthropic integration
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from django.conf import settings

# Import AI libraries
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("Google Generative AI not available")

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    logging.warning("Anthropic not available")

logger = logging.getLogger(__name__)

@dataclass
class AIConfig:
    """Configuration for AI models"""
    primary_model: str = "gemini-2.5-flash"  # Default to Gemini
    fallback_model: str = "claude-3-haiku-20240307"
    temperature: float = 0.1
    max_tokens: int = 1000

class AIService:
    """Service for AI/LLM integration with Google Gemini + Anthropic"""
    
    def __init__(self):
        self.config = AIConfig()
        
        # Initialize Google Gemini
        if GEMINI_AVAILABLE and hasattr(settings, 'GOOGLE_API_KEY'):
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.gemini_available = True
            self.gemini_model = genai.GenerativeModel(self.config.primary_model)
        else:
            self.gemini_available = False
            logger.warning("Google Gemini not configured")
        
        # Initialize Anthropic
        if ANTHROPIC_AVAILABLE and hasattr(settings, 'ANTHROPIC_API_KEY'):
            self.anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.anthropic_available = True
        else:
            self.anthropic_available = False
            logger.warning("Anthropic not configured")
    
    def _call_gemini(self, prompt: str, system_instruction: str = "") -> str:
        """Call Google Gemini API"""
        if not self.gemini_available:
            raise Exception("Google Gemini not available")
        
        try:
            # Configure generation parameters
            generation_config = {
                "temperature": self.config.temperature,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": self.config.max_tokens,
            }
            
            # Create model with system instruction if provided
            if system_instruction:
                model = genai.GenerativeModel(
                    model_name=self.config.primary_model,
                    generation_config=generation_config,
                    system_instruction=system_instruction
                )
            else:
                model = genai.GenerativeModel(
                    model_name=self.config.primary_model,
                    generation_config=generation_config
                )
            
            # Generate response
            response = model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API call failed: {str(e)}")
            raise
    
    def _call_anthropic(self, prompt: str, system_prompt: str = "") -> str:
        """Call Anthropic Claude API"""
        if not self.anthropic_available:
            raise Exception("Anthropic not available")
        
        try:
            messages = [{"role": "user", "content": prompt}]
            
            response = self.anthropic_client.messages.create(
                model=self.config.fallback_model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                system=system_prompt,
                messages=messages
            )
            
            return response.content[0].text
            
        except Exception as e:
            logger.error(f"Anthropic API call failed: {str(e)}")
            raise
    
    def call_ai(self, prompt: str, system_prompt: str = "", use_gemini: bool = True) -> str:
        """
        Call AI with fallback mechanism.
        Prioritizes Gemini, falls back to Anthropic.
        """
        try:
            if use_gemini and self.gemini_available:
                return self._call_gemini(prompt, system_prompt)
            elif self.anthropic_available:
                return self._call_anthropic(prompt, system_prompt)
            else:
                raise Exception("No AI service available")
        except Exception as e:
            logger.error(f"AI call failed: {str(e)}")
            # Try fallback
            if use_gemini and self.anthropic_available:
                logger.info("Falling back to Anthropic")
                return self._call_anthropic(prompt, system_prompt)
            raise
    
    def parse_natural_language_intent(self, text: str, intent_type: str, ai_model: str = "gemini-2.5-flash") -> Dict[str, Any]:
        """
        Parse natural language into structured intent parameters using AI.
        """
        system_prompt = """You are an expert financial intent parser for the Janus Protocol.
        Convert natural language financial intents into structured JSON parameters.
        Be precise, conservative, and security-focused."""
        
        prompt = f"""Parse this user intent into structured JSON parameters:

INTENT TYPE: {intent_type}
USER INTENT: {text}

Extract the following:
1. Target portfolio allocations (asset -> percentage)
2. Rebalancing thresholds and triggers
3. Risk parameters and constraints
4. Execution conditions and timing
5. Safety limits and guardrails

Return ONLY valid JSON with this structure:
{{
    "target_allocations": {{"BTC": 0.5, "ETH": 0.3, "SUI": 0.2}},
    "rebalancing_threshold": 0.05,
    "constraints": {{
        "max_slippage": 0.005,
        "max_gas_per_tx": 20.00,
        "allowed_protocols": ["aave", "compound", "uniswap"],
        "min_liquidity": 1000000
    }},
    "risk_parameters": {{
        "max_drawdown": 0.2,
        "stop_loss": 0.15,
        "max_position_size": 0.3
    }},
    "execution_conditions": {{
        "market_hours_only": false,
        "cooldown_period": 3600,
        "min_confidence": 0.7
    }},
    "confidence_score": 0.85
}}

If the intent is unclear or ambiguous, set confidence_score low and add "requires_manual_review": true."""
        
        try:
            response = self.call_ai(prompt, system_prompt, use_gemini=(ai_model == "gemini-2.5-flash"))
            
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                
                # Add metadata
                result['ai_model_used'] = ai_model
                result['original_intent'] = text
                result['intent_type'] = intent_type
                
                return result
            else:
                raise ValueError("Could not extract JSON from AI response")
                
        except Exception as e:
            logger.error(f"AI intent parsing failed: {str(e)}")
            # Return minimal structure
            return {
                "target_allocations": {},
                "rebalancing_threshold": 0.05,
                "constraints": {
                    "max_slippage": 0.01,
                    "max_gas_per_tx": 50.00,
                    "allowed_protocols": ["aave", "compound"],
                    "min_liquidity": 500000
                },
                "risk_parameters": {
                    "max_drawdown": 0.3,
                    "stop_loss": 0.25
                },
                "execution_conditions": {
                    "market_hours_only": False,
                    "cooldown_period": 3600
                },
                "confidence_score": 0.3,
                "requires_manual_review": True,
                "error": str(e)
            }
    
    def analyze_market_conditions(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze current market conditions using AI.
        """
        system_prompt = """You are an expert crypto market analyst for Janus Protocol.
        Analyze market conditions and provide actionable insights.
        Be data-driven, risk-aware, and practical."""
        
        prompt = f"""Analyze these market conditions and portfolio data:

PORTFOLIO DATA:
{json.dumps(portfolio_data, indent=2)}

Provide analysis with:
1. Current market risk assessment (low/medium/high/critical)
2. Specific opportunities with risk ratings
3. Immediate actions to consider
4. Warning signs and red flags
5. Confidence score in analysis

Return ONLY valid JSON:
{{
    "risk_assessment": "medium",
    "confidence_score": 0.82,
    "opportunities": [
        {{"asset": "ETH", "action": "accumulate", "reason": "upgrade catalyst", "risk": "medium", "confidence": 0.75}}
    ],
    "recommended_actions": ["rebalance_portfolio", "increase_stable_allocation"],
    "warnings": ["high_gas_fees", "low_liquidity_in_defi"],
    "market_sentiment": "neutral_bullish",
    "key_metrics": {{
        "volatility_index": 0.65,
        "fear_greed_index": 55,
        "total_locked_value": 45000000000
    }}
}}"""
        
        try:
            response = self.call_ai(prompt, system_prompt)
            
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                return json.loads(response[json_start:json_end])
                
        except Exception as e:
            logger.error(f"Market analysis failed: {str(e)}")
        
        return {
            "risk_assessment": "unknown",
            "confidence_score": 0.0,
            "opportunities": [],
            "recommended_actions": [],
            "warnings": ["analysis_failed"],
            "market_sentiment": "unknown"
        }
    
    def evaluate_transaction_risk(self, transaction_data: Dict[str, Any], 
                                 policy_data: Dict[str, Any],
                                 intent_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Evaluate transaction safety against policy using AI.
        """
        system_prompt = """You are a security-focused transaction validator for Janus Protocol.
        Evaluate transactions against policies with zero-trust principles.
        Be strict, thorough, and security-first."""
        
        prompt = f"""Evaluate this transaction against user policy:

TRANSACTION DATA:
{json.dumps(transaction_data, indent=2)}

USER POLICY:
{json.dumps(policy_data, indent=2)}

INTENT PARAMETERS:
{json.dumps(intent_data or {}, indent=2)}

Check thoroughly:
1. Amount within daily/transaction limits
2. Protocol is allowed and secure
3. Destination address is safe
4. Gas costs are reasonable
5. Timing is appropriate
6. No security red flags
7. Compliance with intent parameters

Return ONLY valid JSON:
{{
    "is_compliant": true,
    "confidence_score": 0.92,
    "violations": [],
    "risk_score": 0.15,
    "recommendation": "approve",
    "suggestions": ["consider_batching", "wait_for_lower_gas"],
    "specific_checks": {{
        "is_amount_within_limit": true,
        "is_protocol_allowed": true,
        "is_destination_allowed": true,
        "is_gas_within_limit": true,
        "is_kyc_verified": false,
        "is_sanctions_compliant": true
    }}
}}"""
        
        try:
            response = self.call_ai(prompt, system_prompt)
            
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                return json.loads(response[json_start:json_end])
                
        except Exception as e:
            logger.error(f"Transaction risk evaluation failed: {str(e)}")
        
        return {
            "is_compliant": False,
            "confidence_score": 0.0,
            "violations": ["evaluation_failed"],
            "risk_score": 0.9,
            "recommendation": "reject",
            "suggestions": ["manual_review_required"],
            "specific_checks": {
                "is_amount_within_limit": False,
                "is_protocol_allowed": False,
                "is_destination_allowed": False,
                "is_gas_within_limit": False,
                "is_kyc_verified": False,
                "is_sanctions_compliant": False
            }
        }
    
    def generate_emergency_response(self, threat_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate emergency response plan for security threats.
        """
        system_prompt = """You are an emergency response coordinator for Janus Protocol.
        Generate swift, effective security responses to threats.
        Prioritize user fund safety above all else."""
        
        prompt = f"""Security threat detected:

THREAT DATA:
{json.dumps(threat_data, indent=2)}

Generate emergency response plan:
1. Immediate actions to secure funds
2. Communication protocols
3. Recovery procedures
4. Prevention measures
5. Severity assessment

Return ONLY valid JSON:
{{
    "immediate_actions": ["withdraw_funds", "pause_all_agents", "freeze_accounts"],
    "communication_plan": {{
        "user_notification": "immediate_high_priority",
        "support_alert": true,
        "transparency_level": "high"
    }},
    "recovery_steps": ["audit_logs", "security_review", "fund_recovery"],
    "prevention_measures": ["enhance_monitoring", "add_circuit_breakers", "policy_hardening"],
    "severity": "critical",
    "estimated_impact": "high",
    "timeline": {{
        "immediate": ["pause_operations"],
        "short_term": ["investigate", "notify"],
        "long_term": ["enhance_security"]
    }},
    "create_withdrawal": true
}}"""
        
        try:
            response = self.call_ai(prompt, system_prompt)
            
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                return json.loads(response[json_start:json_end])
                
        except Exception as e:
            logger.error(f"Emergency response generation failed: {str(e)}")
        
        return {
            "immediate_actions": ["pause_all_operations"],
            "communication_plan": {"user_notification": "critical"},
            "recovery_steps": [],
            "prevention_measures": [],
            "severity": "unknown",
            "create_withdrawal": True
        }
    
    def generate_execution_plan(self, intent, user_policy: Dict[str, Any], 
                              market_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate execution plan for an intent.
        """
        system_prompt = """You are an execution planner for Janus Protocol.
        Create detailed, executable plans for financial intents.
        Consider market conditions, gas costs, and user preferences."""
        
        prompt = f"""Generate execution plan for intent:

INTENT: {intent.natural_language}
PARSED PARAMETERS: {json.dumps(intent.parsed_parameters, indent=2)}
USER POLICY: {json.dumps(user_policy, indent=2)}
MARKET CONTEXT: {json.dumps(market_context, indent=2)}

Create executable plan with:
1. Specific transactions needed
2. Optimal execution timing
3. Expected costs and slippage
4. Risk assessment
5. Contingency plans

Return ONLY valid JSON:
{{
    "actions": [
        {{
            "type": "swap",
            "from": "USDC",
            "to": "ETH",
            "amount": 1000,
            "protocol": "uniswap_v3",
            "expected_slippage": 0.003,
            "expected_gas": 0.02,
            "priority": "high"
        }}
    ],
    "total_estimated_cost": 25.50,
    "expected_outcome": "portfolio_rebalanced",
    "risk_level": "low",
    "optimal_timing": "next_1_hour",
    "confidence": 0.78,
    "contingency_plan": {{
        "if_high_gas": "wait_6_hours",
        "if_price_volatile": "execute_in_chunks",
        "if_low_liquidity": "use_alternative_protocol"
    }}
}}"""
        
        try:
            response = self.call_ai(prompt, system_prompt)
            
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                return json.loads(response[json_start:json_end])
                
        except Exception as e:
            logger.error(f"Execution plan generation failed: {str(e)}")
        
        return {
            "actions": [],
            "total_estimated_cost": 0,
            "expected_outcome": "unknown",
            "risk_level": "unknown",
            "confidence": 0.0
        }
    
    def test_ai_capabilities(self, prompt: str, agent_type: str, agent_config: Dict[str, Any]) -> str:
        """
        Test AI capabilities with a simple prompt.
        """
        test_prompt = f"""You are a {agent_type} agent for Janus Protocol.
Agent Configuration: {json.dumps(agent_config, indent=2)}

User Query: {prompt}

Please respond as this specialized agent would."""
        
        try:
            return self.call_ai(test_prompt, use_gemini=True)
        except Exception as e:
            return f"AI test failed: {str(e)}"
    
    def suggest_intent_improvements(self, intent) -> List[str]:
        """
        Suggest improvements for an intent.
        """
        prompt = f"""Review this intent and suggest improvements:

INTENT: {intent.natural_language}
TYPE: {intent.intent_type}
CURRENT PARSING: {json.dumps(intent.parsed_parameters, indent=2)}

Suggest specific improvements for clarity, safety, and effectiveness.
Return as a JSON array of suggestions."""
        
        try:
            response = self.call_ai(prompt, use_gemini=True)
            
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            
            if json_start != -1 and json_end != 0:
                return json.loads(response[json_start:json_end])
                
        except Exception as e:
            logger.error(f"Intent improvement suggestions failed: {str(e)}")
        
        return ["Unable to generate suggestions at this time."]


# Singleton instance
ai_service = AIService()