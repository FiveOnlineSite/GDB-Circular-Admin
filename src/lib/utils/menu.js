/* eslint-disable no-unused-vars */
import {
  LayoutDashboard,
  Users,
  Shield,
  Globe,
  FileText,
  Phone,
  Award,
  MessageSquare,
  HelpCircle,
  Image,
  Home,
  BarChart3,
  GitBranch,
  Star,
  Package,
  Truck,
  BookOpen,
  Building,
} from 'lucide-react';

// ROLE_IDS: SUPER_ADMIN = 1, BUILDER = 2, USER = 3
export const MenuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    url: '/dashboard',
    allowedRoles: [1, 2, 3],
    module: 'dashboard'
  },
    
  {
    title: 'Users',
    icon: Users,
    url: '/users',
    allowedRoles: [1, 2],
    module: 'users'
  },
  {
    title: 'Roles & Permissions',
    icon: Shield,
    url: '/role-permissions',
    allowedRoles: [1, 2],
    module: 'roles'
  },
  {
    title: 'Global Content',
    icon: Globe,
    url: '/global-content',
    allowedRoles: [1, 2],
    module: 'globalContent',
    subItems: [
      {
        title: 'SEO & AIEO',
        icon: FileText,
        url: '/global-content/seo',
        exact: true,
        allowedRoles: [1, 2],
        module: 'globalContent'
      },
      {
        title: 'Contact & Footer',
        icon: Phone,
        url: '/global-content/footer',
        allowedRoles: [1, 2],
        module: 'globalContent'
      },
      {
        title: 'Certificates',
        icon: Award,
        url: '/global-content/certificates',
        allowedRoles: [1, 2],
        module: 'globalContent'
      },
      {
        title: 'Inquiries',
        icon: MessageSquare,
        url: '/global-content/inquiries',
        allowedRoles: [1, 2],
        module: 'globalContent'
      },
      {
        title: 'FAQs',
        icon: HelpCircle,
        url: '/global-content/faqs',
        allowedRoles: [1, 2],
        module: 'globalContent'
      },
      {
        title: 'Banners',
        icon: Image,
        url: '/global-content/banners',
        allowedRoles: [1, 2],
        module: 'globalContent'
      },
    ]
  },
  {
    title: 'Homepage',
    icon: Home,
    url: '/homepage-management',
    allowedRoles: [1, 2],
    module: 'homepage',
    subItems: [
      {
        title: 'Stats / Value Strip',
        icon: BarChart3,
        url: '/homepage-management/stats',
        exact: true,
        allowedRoles: [1, 2],
        module: 'homepage'
      },
      {
        title: 'Process Section',
        icon: GitBranch,
        url: '/homepage-management/process',
        exact: true,
        allowedRoles: [1, 2],
        module: 'homepage'
      },
      {
        title: 'Why Choose Us',
        icon: Star,
        url: '/homepage-management/whychoose',
        exact: true,
        allowedRoles: [1, 2],
        module: 'homepage'
      },
    ]
  },
  {
    title: 'Product Listing',
    icon: Package,
    url: '/product-listing',
    allowedRoles: [1, 2],
    module: 'product',
    subItems: [
      {
        title: 'Product Catalogue',
        icon: Package,
        url: '/product-listing/catalogue',
        exact: true,
        allowedRoles: [1, 2],
        module: 'product'
      },
      {
        title: 'Logistics Support',
        icon: Truck,
        url: '/product-listing/logistics-support',
        exact: true,
        allowedRoles: [1, 2],
        module: 'product'
      },
      {
        title: 'Case Study',
        icon: BookOpen,
        url: '/product-listing/case-study',
        exact: true,
        allowedRoles: [1, 2],
        module: 'product'
      },
    ]
  },
  {
    title: 'About GDB',
    icon: Globe,
    url: '/about-gdb',
    allowedRoles: [1, 2],
    module: 'about',
    subItems: [
      {
        title: 'Overview',
        icon: FileText,
        url: '/about-gdb/overview',
        exact: true,
        allowedRoles: [1, 2],
        module: 'about'
      },
      {
        title: 'Journey Timeline',
        icon: GitBranch,
        url: '/about-gdb/journey-timeline',
        exact: true,
        allowedRoles: [1, 2],
        module: 'about'
      },
      {
        title: 'Why Industry Chooses GDB PCR',
        icon: Star,
        url: '/about-gdb/why-industry-chooses-gdb-pcr',
        exact: true,
        allowedRoles: [1, 2],
        module: 'about'
      },
    ]
  },
  {
    title: 'GDB Team',
    icon: Users,
    url: '/team',
    allowedRoles: [1, 2],
    module: 'team',
    subItems: [
      {
        title: 'Team Members',
        icon: Users,
        url: '/team/members',
        exact: true,
        allowedRoles: [1, 2],
        module: 'team',
        action: 'members.view'
      },
      {
        title: 'Life at GDB Circular',
        icon: Image,
        url: '/team/life-at-gdb',
        exact: true,
        allowedRoles: [1, 2],
        module: 'team',
        action: 'life.view'
      }
    ]
  },
  {
    title: 'Sellers Page',
    icon: FileText,
    url: '/sellers',
    allowedRoles: [1, 2],
    module: 'sellers',
    subItems: [
      {
        title: "We're Always Buying",
        icon: Star,
        url: '/sellers/always-buying',
        exact: true,
        allowedRoles: [1, 2],
        module: 'sellers',
        action: 'buying.view'
      },
      {
        title: 'Feedstock Catalogue',
        icon: Package,
        url: '/sellers/feedstock-catalogue',
        exact: true,
        allowedRoles: [1, 2],
        module: 'sellers',
        action: 'feedstock.view'
      },
      {
        title: 'Supplier Inquiries',
        icon: MessageSquare,
        url: '/sellers/inquiries',
        exact: true,
        allowedRoles: [1, 2],
        module: 'sellers',
        action: 'inquiry.view'
      }
    ]
  },
  {
    title: 'News & Updates',
    icon: FileText,
    url: '/news-updates',
    allowedRoles: [1, 2],
    module: 'news',
    subItems: [
      {
        title: 'Categories',
        icon: GitBranch,
        url: '/news-updates/categories',
        exact: true,
        allowedRoles: [1, 2],
        module: 'news',
        action: 'category.view'
      },
      {
        title: 'News & Updates',
        icon: FileText,
        url: '/news-updates',
        exact: true,
        allowedRoles: [1, 2],
        module: 'news',
        action: 'content.view'
      }
    ]
  },
  {
      title: 'Facilities',
      icon: Building,
      url: '/facilities',
      allowedRoles: [1, 2],
      module: 'facilities'
    },
  {
    title: 'Settings',
    icon: Shield,
    url: '/settings',
    allowedRoles: [1, 2],
    module: 'settings',
    subItems: [
      {
        title: 'Media Rules',
        icon: Image,
        url: '/settings/media-rules',
        exact: true,
        allowedRoles: [1, 2],
        module: 'settings',
        action: 'rules.view'
      }
    ]
  },


];
