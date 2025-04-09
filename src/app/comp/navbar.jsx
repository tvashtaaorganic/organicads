"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  ChevronDown,
  ChevronUp,
  GalleryHorizontalEnd,
  Wallet,
  IndianRupee,
  ShoppingBag,
  Ruler,
  Percent,
  CalendarDays,
  QrCode,
  Link2,
  Command,
  Tags,
  RectangleEllipsis,
  Loader,
  Bot,
  Youtube,
  Instagram,
  Captions,
  CircleGauge,
  Calculator,
  CodeXml,
  ImageDown,
  FileJson2,
  FileCode2,
  Tag,
  Split,
  ClipboardCheck,
  Text 
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/" },
  {
    name: "Calculators",
    dropdown: [
      {
        name: "EMI Calculator",
        href: "/emi-calculator",
        icon: <Wallet className="w-5 h-5" />,
        description: "Calculate loans and EMIs and total payments",
      },
      {
        name: "GST Calculator",
        href: "/gst-calculator",
        icon: <IndianRupee className="w-5 h-5" />,
        description: "Calculate gst amounts and total prices",
      },
      {
        name: "ECommerce Profit Calculator",
        href: "/ecommerce-profit-calculator",
        icon: <ShoppingBag className="w-5 h-5" />,
        description: "Calculate eCommerce product profitability",
      },
      {
        name: "Area Calculator",
        href: "/real-estate-area-calculator",
        icon: <Ruler className="w-5 h-5" />,
        description: "Convert between different area units",
      },
      {
        name: "Percentage Calculator",
        href: "/percentage-calculator",
        icon: <Percent className="w-5 h-5" />,
        description: "Calculate percentages easily with our intuitive calculator",
      },
      {
        name: "Date Difference Calculator",
        href: "/date-difference-calculator",
        icon: <CalendarDays className="w-5 h-5" />,
        description: "Calculate difference between dates",
      },
      {
        name: "Marketing ROI Calculator",
        href: "/marketing-roi-calculator",
        icon: <Calculator className="w-5 h-5" />,
        description: "Calculate difference between dates",
      },
    ],
  },
  {
    name: "SEO Tools",
    dropdown: [
      {
        name: "Keyword Density Checker",
        href: "/keyword-density-checker",
        icon: <Command className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Meta Tag Analyzer",
        href: "/extract-meta-tags",
        icon: <Tags className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Word Counter",
        href: "/word-counter",
        icon: <RectangleEllipsis className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "XML Sitemap Generator",
        href: "/xml-sitemap-generator",
        icon: <Loader className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Robots Txt Generator",
        href: "/robots-txt-generator",
        icon: <Bot className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Title & Meta Description Checker",
        href: "/title-description-checker",
        icon: <Captions className="w-5 h-5" />,
        description: "Check keyword density in your content",
      }, 
      {
        name: "Website Speed Test",
        href: "/website-speed-test",
        icon: <CircleGauge className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Minify HTML, CSS, JS",
        href: "/minify-html-css-js",
        icon: <CodeXml className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Schema Markup Generator",
        href: "/schema-markup-generator",
        icon: <FileJson2 className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Slug/URL Generator",
        href: "/slug-url-generator",
        icon: <FileCode2 className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Open Graph (OG) Generator",
        href: "/open-graph-generator",
        icon: <Tag className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Htacess Redirect Generator",
        href: "/htaccess-redirect-generator",
        icon: <Split className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "LSI Keyword Suggestion Tool",
        href: "/lsi-keyword-suggestion-tool",
        icon: <ClipboardCheck className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },
      {
        name: "Google SERP Simulator",
        href: "/google-serp-simulator",
        icon: <Text className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },

    ],
  },
  {
    name: "Utilities",
    dropdown: [
      {
        name: "QR Code Generator",
        href: "/qr-code-generator",
        icon: <QrCode className="w-5 h-5" />,
        description: "Generate QR Codes for any text or URL",
      },
      {
        name: "URL Shortener",
        href: "/url-shortener",
        icon: <Link2 className="w-5 h-5" />,
        description: "Short URL for any website",
      },
      {
        name: "Image Optimizer",
        href: "/image-optimizer",
        icon: <ImageDown className="w-5 h-5" />,
        description: "Check keyword density in your content",
      },

    ],
  },
  {
    name: "Downloader",
    dropdown: [
      {
        name: "Instagram Download",
        href: "/instagram-downloader",
        icon: <Instagram className="w-5 h-5" />,
        description: "Generate QR Codes for any text or URL",
      },
      {
        name: "Youtube Download",
        href: "/youtube-downloader",
        icon: <Youtube className="w-5 h-5" />,
        description: "Generate QR Codes for any text or URL",
      },
      {
        name: "Pinterest Download",
        href: "/pinterest-downloader",
        icon: <Youtube className="w-5 h-5" />,
        description: "Generate QR Codes for any text or URL",
      },


    ],
  },
];

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <nav className="w-full bg-white shadow relative z-50 font-poppins">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo on Left */}
        <Link href="/" className="flex items-center">
          <GalleryHorizontalEnd className="mr-2" /> Organic Ads
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-3 relative items-center mx-auto">
          {navItems.map((item, index) => (
            <li key={index} className="relative flex items-center">
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="px-4 py-2 font-medium hover:text-blue-600 focus:outline-none flex items-center"
                  >
                    {item.name}{" "}
                    {openDropdown === item.name ? (
                      <ChevronUp size={16} className="ml-2" />
                    ) : (
                      <ChevronDown size={16} className="ml-2" />
                    )}
                  </button>
                  {openDropdown === item.name && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-[600px] bg-white shadow-lg rounded-md overflow-hidden z-50 transition-all duration-300 ease-in-out opacity-100">
                      <div className="grid grid-cols-2 gap-4 p-4">
                        {item.dropdown.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className="p-3 hover:bg-gray-100 rounded-md flex flex-col items-start gap-1"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <div className="flex items-center gap-2">
                              {subItem.icon && subItem.icon}
                              <span className="font-medium text-sm">{subItem.name}</span>
                            </div>
                            {subItem.description && (
                              <span className="text-xs text-gray-500 font-semibold text-left">
                                {subItem.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href} className="px-4 py-2 font-medium hover:text-blue-600">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Request Quote Button (Desktop) */}
        <div className="hidden md:block">
          <Link href="/get-quote">
            <Button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md focus:outline-none"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Menu with Smooth Transition (Mobile View) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div
          className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-6 flex flex-col space-y-6 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="self-end text-xl" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
          {navItems.map((item, index) => (
            <div key={index} className="relative">
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="w-full text-left px-4 py-2 font-medium hover:text-blue-600 focus:outline-none flex items-center justify-between"
                  >
                    {item.name}{" "}
                    {openDropdown === item.name ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {openDropdown === item.name && (
                    <div className="pl-2 mt-2 space-y-2">
                      {item.dropdown.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setOpenDropdown(null);
                            setSidebarOpen(false);
                          }}
                        >
                          {subItem.icon && subItem.icon}
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="block px-4 py-2 font-medium hover:text-blue-600"
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
          {/* Request Quote Button (Mobile) */}
          <Link href="">
            <Button className="w-full bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}