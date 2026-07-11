import React from 'react';
import { Link } from 'react-router-dom';
import {
    Globe,
    Share2,
    MessageCircle,
    Link as LinkIcon,
    Send,
    Feather,
} from 'lucide-react'

const links = [
    {
        title: 'Twitter',
        href: '#',
    },
    {
        title: 'GitHub',
        href: '#',
    },
    {
        title: 'Discord',
        href: '#',
    },
    {
        title: 'Docs',
        href: '#',
    },
    {
        title: 'Privacy',
        href: '#',
    },
    {
        title: 'Security',
        href: '#',
    },
]

export default function FooterSection() {
    return (
        <footer className="py-16 md:py-32 border-t border-outline-variant/10 bg-[#121315]">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    to="/"
                    aria-label="go home"
                    className="mx-auto block size-fit mb-8">
                     <div className="text-2xl font-black tracking-tighter text-[#00D09C]">JANUS</div>
                </Link>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            className="text-on-surface-variant hover:text-primary block duration-150 font-mono uppercase tracking-widest text-xs">
                            <span>{link.title}</span>
                        </a>
                    ))}
                </div>
                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {/* Using generic icons for social links */}
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 1"
                        className="text-on-surface-variant hover:text-primary block transition-all hover:-translate-y-1">
                        <Share2 className="size-6" />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 2"
                        className="text-on-surface-variant hover:text-primary block transition-all hover:-translate-y-1">
                        <MessageCircle className="size-6" />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 3"
                        className="text-on-surface-variant hover:text-primary block transition-all hover:-translate-y-1">
                        <LinkIcon className="size-6" />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 4"
                        className="text-on-surface-variant hover:text-primary block transition-all hover:-translate-y-1">
                        <Globe className="size-6" />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 5"
                        className="text-on-surface-variant hover:text-primary block transition-all hover:-translate-y-1">
                        <Send className="size-6" />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Social Link 6"
                        className="text-on-surface-variant hover:text-primary block transition-all hover:-translate-y-1">
                        <Feather className="size-6" />
                    </a>
                </div>
                <span className="text-on-surface-variant/40 block text-center text-[10px] font-mono tracking-widest uppercase"> 
                    © {new Date().getFullYear()} Janus Protocol. Encrypted by Design.
                </span>
            </div>
        </footer>
    )
}
