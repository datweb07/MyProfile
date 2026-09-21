'use client';

import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {logoutAction} from '@/app/admin/actions';

type IconName = 'posts' | 'new' | 'writing' | 'portfolio' | 'logout';

function SidebarIcon({name}: {name: IconName}) {
  const paths: Record<IconName, ReactNode> = {
    posts: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    new: <><path d="M12 5v14M5 12h14"/><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/></>,
    writing: <><path d="M4 19.5V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14.5"/><path d="M4 17h16M8 7h7M8 11h7"/></>,
    portfolio: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/></>,
    logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M8 12h10"/></>
  };

  return <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function AdminShell({email, children}: {email: string; children: ReactNode}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem('admin-sidebar-collapsed') === 'true');
  }, []);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  }

  const links: {href: string; label: string; icon: IconName; active: boolean}[] = [
    {href: '/admin/posts', label: 'All posts', icon: 'posts', active: pathname.startsWith('/admin/posts') && pathname !== '/admin/posts/new'},
    {href: '/admin/posts/new', label: 'New post', icon: 'new', active: pathname === '/admin/posts/new'},
    {href: '/en#writing', label: 'Latest writing', icon: 'writing', active: false},
    {href: '/en', label: 'Portfolio', icon: 'portfolio', active: false}
  ];

  return (
    <div className={`admin-shell${collapsed ? ' is-sidebar-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link className="admin-brand" href="/admin/posts" title="DAT / CMS">
            <span className="admin-brand-mark">D</span>
            <span className="admin-sidebar-label">DAT / CMS</span>
          </Link>
          <button
            className="admin-sidebar-toggle"
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
          </button>
        </div>

        <nav aria-label="Admin navigation">
          {links.map((link) => (
            <Link key={link.href} className={link.active ? 'is-active' : ''} href={link.href} title={collapsed ? link.label : undefined}>
              <span className="admin-nav-icon-wrap"><SidebarIcon name={link.icon} /></span>
              <span className="admin-sidebar-label">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-account">
          <div className="admin-account-email" title={email}>
            <span className="admin-account-avatar">{email.charAt(0).toUpperCase()}</span>
            <small className="admin-sidebar-label">{email}</small>
          </div>
          <form action={logoutAction}>
            <button type="submit" title={collapsed ? 'Sign out' : undefined}>
              <span className="admin-nav-icon-wrap"><SidebarIcon name="logout" /></span>
              <span className="admin-sidebar-label">Sign out</span>
            </button>
          </form>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
