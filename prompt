You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
footer.tsx

import Link from 'next/link'

// Import generic icons from lucide-react
import {
    Globe, // Could represent a website or general online presence
    Share2, // Could represent sharing/social media in general
    MessageCircle, // Could represent communication/social
    Link as LinkIcon, // Renamed to avoid conflict with Next.js Link
    Send, // Could represent sending a message, a bit like a paper plane for social
    Feather, // Could be an abstract representation for a 'feed' or 'post'
} from 'lucide-react'

const links = [
    {
        title: 'Features',
        href: '#',
    },
    {
        title: 'Solution',
        href: '#',
    },
    {
        title: 'Customers',
        href: '#',
    },
    {
        title: 'Pricing',
        href: '#',
    },
    {
        title: 'Help',
        href: '#',
    },
    {
        title: 'About',
        href: '#',
    },
]

export default function FooterSection() {
    return (
        <footer className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit">
                </Link>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary block duration-150">
                            <span>{link.title}</span>
                        </Link>
                    ))}
                </div>
                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {/* Using generic icons for social links */}
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 1" // Generic label
                        className="text-muted-foreground hover:text-primary block">
                        <Share2 className="size-6" /> {/* Generic "Share" icon */}
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 2"
                        className="text-muted-foreground hover:text-primary block">
                        <MessageCircle className="size-6" /> {/* Generic "Message" icon */}
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 3"
                        className="text-muted-foreground hover:text-primary block">
                        <LinkIcon className="size-6" /> {/* Generic "Link" icon */}
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 4"
                        className="text-muted-foreground hover:text-primary block">
                        <Globe className="size-6" /> {/* Generic "Globe" (website/world) icon */}
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 5"
                        className="text-muted-foreground hover:text-primary block">
                        <Send className="size-6" /> {/* Generic "Send" icon */}
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 6"
                        className="text-muted-foreground hover:text-primary block">
                        <Feather className="size-6" /> {/* Generic "Feather" (post/write) icon */}
                    </Link>
                </div>
                <span className="text-muted-foreground block text-center text-sm"> © {new Date().getFullYear()} Tailark, All rights reserved</span>
            </div>
        </footer>
    )
}

demo.tsx
import FooterSection from "@/components/ui/footer";

export default function DemoOne() {
  return <FooterSection />;
}

```

Install NPM dependencies:
```bash
next, lucide-react
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
