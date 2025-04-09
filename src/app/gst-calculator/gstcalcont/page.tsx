"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GSTCalculator() {
  const [amount, setAmount] = useState(""); // No default amount
  const [gstRate, setGstRate] = useState("3"); // Default GST rate set to 3%
  const [isAddGST, setIsAddGST] = useState(true);

  // Calculate GST only if amount and GST rate are valid
  const calculateGST = () => {
    // If amount or GST rate is empty, return zero values
    if (!amount || !gstRate) {
      return {
        baseAmount: "0.00",
        gstAmount: "0.00",
        totalAmount: "0.00",
      };
    }

    const parsedAmount = Number(amount);
    const parsedGstRate = Number(gstRate);

    const baseAmount = isAddGST
      ? parsedAmount / (1 + parsedGstRate / 100)
      : parsedAmount;
    const gstAmount = isAddGST
      ? parsedAmount - baseAmount
      : (baseAmount * parsedGstRate) / 100;
    const totalAmount = isAddGST ? parsedAmount : baseAmount + gstAmount;
    return {
      baseAmount: baseAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  const { baseAmount, gstAmount, totalAmount } = calculateGST();

  const handleReset = () => {
    setAmount("");
    setGstRate("3");
    setIsAddGST(true);
  };

  const shareOnWhatsApp = () => {
    const message = `Check out this awesome GST Calculator:\n\nhttps://yourwebsite.com/gst-calculator`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Section - Calculator */}
      <div className="md:col-span-8 bg-white p-6 rounded-lg shadow-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">GST Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add/Remove GST Toggle */}
            <div className="flex space-x-2 mb-4">
              <Button
                onClick={() => setIsAddGST(true)}
                className={`w-1/2 ${isAddGST ? "bg-blue-500" : "bg-gray-300"}`}
              >
                Add GST
              </Button>
              <Button
                onClick={() => setIsAddGST(false)}
                className={`w-1/2 ${!isAddGST ? "bg-blue-500" : "bg-gray-300"}`}
              >
                Remove GST
              </Button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Amount ({isAddGST ? "with GST" : "without GST"})
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full"
              />
            </div>

            {/* GST Rate Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select GST Rate</label>
              <div className="flex space-x-2">
                {[3, 5, 12, 18, 28].map((rate) => (
                  <Button
                    key={rate}
                    onClick={() => setGstRate(rate.toString())}
                    className={`flex-1 ${gstRate === rate.toString() ? "bg-blue-500" : "bg-gray-400"}`}
                  >
                    {rate}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom GST Rate Input */}
            <div className="flex space-x-2 mb-4">
              <Input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                placeholder="Custom GST"
                className="w-1/2"
              />
              <span className="text-lg">%</span>
            </div>

            {/* Results */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Amount:</span>
                <span>₹{baseAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Amount ({gstRate || 0}%):</span>
                <span>₹{gstAmount}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {/* Reset Button */}
            <Button onClick={handleReset} className="w-full mt-4 bg-black">
              Reset
            </Button>
          </CardContent>
        </Card>

        {/* Share on WhatsApp Button */}
        <div className="flex justify-center items-center mt-6 mb-4">
          <button
            onClick={shareOnWhatsApp}
            className="inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-6 py-2"
          >
            Share on WhatsApp
          </button>
        </div>

        <section className="mt-12 prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">About GST Calculator</h2>
          <div className="space-y-4">
            <p>
              Our GST (Goods and Services Tax) Calculator is a versatile tool that helps you calculate both inclusive and exclusive GST amounts. Whether you need to add GST to a base amount or extract GST from an inclusive amount, this calculator makes it simple and accurate. It\'s particularly useful when working with invoices, pricing, or checking your{' '}
              <Link href="/profit-loss-calculator" className="text-primary hover:underline">
                profit margins
              </Link>.
            </p>
            <h3 className="text-xl font-medium">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Dual Functionality:</strong> Add or remove GST with a simple tab switch
              </li>
              <li>
                <strong>Common GST Rates:</strong> Quick buttons for standard GST rates (3%, 5%, 12%, 18%, 28%)
              </li>
              <li>
                <strong>Custom Rates:</strong> Option to enter any GST percentage
              </li>
              <li>
                <strong>Instant Calculations:</strong> See results as you type
              </li>
            </ul>
            <h3 className="text-xl font-medium">Common Uses:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Invoice calculations</li>
              <li>Price quotations</li>
              <li>Business expense tracking</li>
              <li>Retail pricing calculations</li>
              <li>
                <Link href="/profit-loss-calculator" className="text-primary hover:underline">
                  Profit/Loss analysis
                </Link>{' '}
                with tax considerations
              </li>
              <li>Budget planning with tax implications</li>
            </ul>
            <h3 className="text-xl font-medium">How to Use:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Choose whether to add or remove GST</li>
              <li>Enter the amount</li>
              <li>Select a GST rate or enter a custom rate</li>
              <li>View the detailed breakdown instantly</li>
              <li>Use Reset to start a new calculation</li>
            </ol>
            <p>
              For more financial calculations, try our{' '}
              <Link href="/emi-calculator" className="text-primary hover:underline">
                EMI Calculator
              </Link>{' '}
              for loan payments or our{' '}
              <Link href="/" className="text-primary hover:underline">
                Percentage Calculator
              </Link>{' '}
              for basic percentage calculations. If you\'re working with dates for tax periods, our{' '}
              <Link href="/date-difference-calculator" className="text-primary hover:underline">
                Date Difference Calculator
              </Link>{' '}
              can help you determine exact periods.
            </p>
          </div>
        </section>
      </div>

      {/* Right Section - Quick Tips */}
      <div className="md:col-span-4 bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="bg-blue-100 rounded-lg p-4">
          <h3 className="font-medium text-lg mb-2">Quick Tips</h3>
          <ul className="text-sm space-y-2">
            <li>• Use tab key to move between fields</li>
            <li>• Results update automatically</li>
            <li>• Recent calculations are saved</li>
          </ul>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-2">Calculator Stats</h4>
          <p className="text-sm">Trusted by students and professionals</p>
          <p className="text-xs mt-1 text-muted-foreground">Over 10,000 calculations daily</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <Image
            src="https://res.cloudinary.com/djiki7tvo/image/upload/v1743084283/website-redesign_kex22a.webp"
            alt="Best Web Development Company in Bangalore"
            width={500}
            height={300}
            className="w-full rounded-lg mb-3"
          />
          <h3 className="font-medium text-xl mb-2">Best Web Development Company in Bangalore</h3>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {Array(5).fill(0).map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium">4.8</span>
            <Link href="" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline ml-2">
              720+ Google Reviews
            </Link>
          </div>

          <div className="mb-3">
            <h4 className="font-semibold mb-2">Trustpilot Ratings</h4>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <div className="text-5xl font-bold">4.8</div>
                  <div className="text-lg font-semibold">Excellent</div>
                  <div className="flex text-[#00b67a]">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm mt-1">797 reviews</div>
                </div>
                <div className="flex-1 space-y-1">
                  {[92, 5, 2, 1, 0].map((width, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="text-sm w-12">{5 - i}-star</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-[#00b67a] rounded-full" style={{ width: `${width}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm mb-4">
            🎯 We build your business into a Brand. 🌐 Helping Businesses Increase Leads, Traffic & Sales!. 🚀 Google, Bing Rank Your Web Page in Just 4 Hours!. 🚀 Web Design | Digital Marketing | SEO, SEM, SMM | Google, Meta Ads | Branding
          </p>
          <Link href="https://www.organicads.in/" target="_blank" rel="noopener noreferrer">
            <button className="w-full bg-primary text-white font-medium py-2 rounded-md hover:bg-primary/90 transition">
              Check details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}