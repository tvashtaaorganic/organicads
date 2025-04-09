'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/percentage-calculator" className="text-sm text-muted-foreground hover:text-foreground">Percentage Calculator</Link></li>
              <li><Link href="/gst-calculator" className="text-sm text-muted-foreground hover:text-foreground">GST Calculator</Link></li>
              <li><Link href="/emi-calculator" className="text-sm text-muted-foreground hover:text-foreground">EMI Calculator</Link></li>
              <li><Link href="/marketing-roi-calculator" className="text-sm text-muted-foreground hover:text-foreground">Marketing ROI Calculator </Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">More Tools</h3>
            <ul className="space-y-2">
              <li><Link href="/date-difference-calculator" className="text-sm text-muted-foreground hover:text-foreground">Date Difference Calculator</Link></li>
              <li><Link href="/ecommerce-profit-calculator" className="text-sm text-muted-foreground hover:text-foreground">E-Commerce Product Profit Calculator
              </Link></li>
              <li><Link href="/real-estate-area-calculator" className="text-sm text-muted-foreground hover:text-foreground">Area Calculator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="https://www.organicads.in/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="https://www.organicads.in/contactus" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="" className="text-sm text-muted-foreground hover:text-foreground">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">© 2025 Organicads.in. All rights reserved.</div>
            <div className="text-sm text-muted-foreground">
              Developed by <a href="mailto:contact@organicads.in" className="text-primary hover:underline">Shrikanth</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
