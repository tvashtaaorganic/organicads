"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";

export default function EcommerceProfitCalculator() {
    const [productCost, setProductCost] = useState("");
    const [shippingCost, setShippingCost] = useState("");
    const [packagingCost, setPackagingCost] = useState("");
    const [marketingCost, setMarketingCost] = useState("");
    const [platformFees, setPlatformFees] = useState("");
    const [additionalCosts, setAdditionalCosts] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [includeGST, setIncludeGST] = useState(false);
    const [gstRate, setGstRate] = useState("");
    const [includePaymentFees, setIncludePaymentFees] = useState(false);
    const [paymentFeesRate, setPaymentFeesRate] = useState("");
    const [showResults, setShowResults] = useState(false);
  
    // Function to format numbers with commas in Indian style
    const formatNumber = (number) => {
      return Number(number).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };
  
    // Handler to prevent arrow key increment/decrement
    const preventArrowKeys = (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      }
    };
  
    // Handler to enforce minimum value of 0
    const enforceMinValue = (value, setter) => {
      if (value === "") {
        setter("");
      } else {
        const numValue = Number(value);
        if (numValue >= 0) {
          setter(numValue.toString());
        }
      }
    };
  
    // Calculate profit and breakeven analysis
const calculateProfit = () => {
    // Parse all costs and selling price
    const product = Number(productCost) || 0;
    const shipping = Number(shippingCost) || 0;
    const packaging = Number(packagingCost) || 0;
    const marketing = Number(marketingCost) || 0;
    const platform = Number(platformFees) || 0;
    const additional = Number(additionalCosts) || 0;
    const price = Number(sellingPrice) || 0;
    const gst = Number(gstRate) || 0;
    const paymentFees = Number(paymentFeesRate) || 0;
  
    // Calculate base costs
    const baseCosts = product + shipping + packaging + marketing + platform + additional;
  
    // Calculate GST (GST is added on top of the selling price when "Include GST" is checked)
    let gstAmount = 0;
    if (includeGST && gst > 0) {
      gstAmount = (price * gst) / 100; // GST is 5% of the selling price
    } else if (gst > 0) {
      gstAmount = (baseCosts * gst) / 100; // GST on base costs if not included
    }
  
    // Calculate payment gateway fees (on the selling price)
    const paymentGatewayFees = includePaymentFees && paymentFees > 0 ? (price * paymentFees) / 100 : 0;
  
    // Total costs (base costs + GST + payment gateway fees)
    const totalCosts = baseCosts + gstAmount + paymentGatewayFees;
  
    // Profit per product
    const profitPerProduct = price - totalCosts;
  
    // Profit margin
    const profitMargin = price > 0 ? (profitPerProduct / price) * 100 : 0;
  
    // Breakeven analysis
    // Units to break even
    const profitPerUnit = price - (baseCosts / (price > 0 ? 1 : 1));
    const breakevenUnits = profitPerUnit > 0 ? Math.ceil(baseCosts / profitPerUnit) : 0;
  
    // Suggested selling price for different margins (using totalCosts)
    const breakeven20 = totalCosts / (1 - 0.2); // 20% margin
    const breakeven30 = totalCosts / (1 - 0.3); // 30% margin
    const breakeven50 = totalCosts / (1 - 0.5); // 50% margin
  

      return {
        baseCosts: formatNumber(baseCosts),
    gstAmount: formatNumber(gstAmount),
    paymentGatewayFees: formatNumber(paymentGatewayFees),
    totalCosts: formatNumber(totalCosts),
    profitPerProduct: formatNumber(profitPerProduct),
    profitMargin: profitMargin.toFixed(2),
    breakevenUnits,
    breakeven20: formatNumber(breakeven20),
    breakeven30: formatNumber(breakeven30),
    breakeven50: formatNumber(breakeven50),
      };
    };
  
    const handleCalculate = () => {
      if (sellingPrice && productCost) {
        setShowResults(true);
      }
    };
  
    const handleReset = () => {
      setProductCost("");
      setShippingCost("");
      setPackagingCost("");
      setMarketingCost("");
      setPlatformFees("");
      setAdditionalCosts("");
      setSellingPrice("");
      setIncludeGST(false);
      setGstRate("");
      setIncludePaymentFees(false);
      setPaymentFeesRate("");
      setShowResults(false);
    };
  
    const results = calculateProfit();

  const shareOnWhatsApp = () => {
    const message = `Check out this awesome Loan EMI Calculator:\n\nhttps://yourwebsite.com/loan-emi-calculator`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Section - Calculator */}
      <div className="md:col-span-8 bg-white p-6 rounded-lg shadow-md">
        <Card className="">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              eCommerce Product Profit Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cost Breakdown */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-4">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Cost (₹)
                    </label>
                    <Input
                type="number"
                value={productCost}
                onChange={(e) => enforceMinValue(e.target.value, setProductCost)}
                onKeyDown={preventArrowKeys}
                placeholder="Enter cost"
                className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onBlur={handleCalculate}
              />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Shipping Cost (₹)
                    </label>
                    <Input
                type="number"
                value={shippingCost}
                onChange={(e) => enforceMinValue(e.target.value, setShippingCost)}
                onKeyDown={preventArrowKeys}
                placeholder="Enter cost"
                className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onBlur={handleCalculate}
              />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Packaging Cost (₹)
                    </label>
                    <Input
                type="number"
                value={packagingCost}
                onChange={(e) => enforceMinValue(e.target.value, setPackagingCost)}
                onKeyDown={preventArrowKeys}
                placeholder="Enter cost"
                className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onBlur={handleCalculate}
              />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Marketing/Ad Spend (₹)
                    </label>
                    <Input
                type="number"
                value={marketingCost}
                onChange={(e) => enforceMinValue(e.target.value, setMarketingCost)}
                onKeyDown={preventArrowKeys}
                placeholder="Enter cost"
                className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onBlur={handleCalculate}
              />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Platform Fees (₹)
                    </label>
                    <Input
                type="number"
                value={platformFees}
                onChange={(e) => enforceMinValue(e.target.value, setPlatformFees)}
                onKeyDown={preventArrowKeys}
                placeholder="Enter cost"
                className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onBlur={handleCalculate}
              />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Additional Costs (₹)
                    </label>
                    <Input
                type="number"
                value={additionalCosts}
                onChange={(e) => enforceMinValue(e.target.value, setAdditionalCosts)}
                onKeyDown={preventArrowKeys}
                placeholder="Enter additional costs"
                className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onBlur={handleCalculate}
              />
                  </div>
                </div>
              </div>
            </div>

            {/* Selling Price */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-4">Selling Price</h3>
                <label className="block text-sm font-medium mb-1">
                  Selling Price (₹)
                </label>
                <Input
            type="number"
            value={sellingPrice}
            onChange={(e) => enforceMinValue(e.target.value, setSellingPrice)}
            onKeyDown={preventArrowKeys}
            placeholder="Enter selling price"
            className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            onBlur={handleCalculate}
          />
              </div>
            </div>

            {/* Tax & Fees */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-4">Tax & Fees</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                        checked={includeGST}
                        onCheckedChange={(checked) => setIncludeGST(checked)}
                        />
                      <label className="text-sm font-medium">Include GST</label>
                    </div>
                    <Input
                type="number"
                value={gstRate}
                onChange={(e) => enforceMinValue(e.target.value, setGstRate)}
                onKeyDown={preventArrowKeys}
                placeholder="GST %"
                className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={!includeGST}
                onBlur={handleCalculate}
              />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                  checked={includePaymentFees}
                  onCheckedChange={(checked) => setIncludePaymentFees(checked)}
                />
                      <label className="text-sm font-medium">
                        Include Payment Gateway Fees
                      </label>
                    </div>
                    <Input
                type="number"
                value={paymentFeesRate}
                onChange={(e) => enforceMinValue(e.target.value, setPaymentFeesRate)}
                onKeyDown={preventArrowKeys}
                placeholder="Payment Fees %"
                className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={!includePaymentFees}
                onBlur={handleCalculate}
              />
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Analysis */}
            {showResults && (
              <div className="bg-[#F8F9FF] p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Profit Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Base Costs</p>
                  <p className="text-lg font-semibold">₹{results.baseCosts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">GST Amount</p>
                  <p className="text-lg font-semibold">₹{results.gstAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Gateway Fees</p>
                  <p className="text-lg font-semibold">₹{results.paymentGatewayFees}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Costs</p>
                  <p className="text-lg font-semibold">₹{results.totalCosts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profit Per Product</p>
                  <p className="text-lg font-semibold text-green-600">
                  ₹{results.profitPerProduct}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-lg font-semibold text-green-600">
                  {results.profitMargin}%
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* Breakeven Analysis */}
{showResults && (
      <div className="bg-white p-6 rounded-lg border">
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">Breakeven Analysis</h3>
    <p className="text-md text-gray-600 mb-4 font-medium">
      You need to sell {results.breakevenUnits} units to break even.
    </p>
    <h3 className="text-md text-gray-600 font-medium mb-2">
      Suggested selling price for different margins:
    </h3>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-gray-600">20% Margin</p>
        <p className="text-lg font-semibold">₹{results.breakeven20}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">30% Margin</p>
        <p className="text-lg font-semibold">₹{results.breakeven30}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">50% Margin</p>
        <p className="text-lg font-semibold">₹{results.breakeven50}</p>
      </div>
    </div>
  </div>
  </div>

)}

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
          <h2 className="text-2xl font-semibold mb-4">
            About eCommerce Product Profit Calculator
          </h2>
          <div className="space-y-4">
            <p>
              Our eCommerce Product Profit Calculator is a comprehensive tool
              designed to help online sellers accurately calculate their product
              profitability. It takes into account all costs involved in selling
              products online, including product costs, shipping, packaging,
              marketing, platform fees, and even tax considerations. Use it
              alongside our
              <a
                href="/gst-calculator"
                className="text-primary hover:underline"
              >
                {" "}
                GST Calculator{" "}
              </a>
              and
              <a
                href="/profit-loss-calculator"
                className="text-primary hover:underline"
              >
                {" "}
                Profit Loss Calculator{" "}
              </a>
              for complete financial analysis.
            </p>
            <h3 className="text-xl font-medium">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Comprehensive Cost Analysis:</strong> Account for all
                expenses
              </li>
              <li>
                <strong>Tax Integration:</strong> Optional GST and payment
                gateway fees
              </li>
              <li>
                <strong>Breakeven Analysis:</strong> Know how many units you
                need to sell
              </li>
              <li>
                <strong>Pricing Suggestions:</strong> Get recommended prices for
                different margins
              </li>
              <li>
                <strong>Real-time Calculations:</strong> See results as you
                input values
              </li>
            </ul>
            <h3 className="text-xl font-medium">Common Uses:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product pricing strategy</li>
              <li>Profit margin analysis</li>
              <li>Cost optimization</li>
              <li>Breakeven planning</li>
              <li>Platform fee comparison</li>
              <li>Marketing budget planning</li>
            </ul>
            <h3 className="text-xl font-medium">How to Use:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Enter all your product-related costs</li>
              <li>Input your selling price</li>
              <li>Toggle tax and payment gateway fees if applicable</li>
              <li>View profit analysis and breakeven points</li>
              <li>Check suggested prices for different margins</li>
              <li>Use Reset to start a new calculation</li>
            </ol>
            <p>
              For more detailed financial analysis, consider using our
              <a
                href="/emi-calculator"
                className="text-primary hover:underline"
              >
                {" "}
                EMI Calculator{" "}
              </a>
              for business loans and our
              <a
                href="/gst-calculator"
                className="text-primary hover:underline"
              >
                {" "}
                GST Calculator{" "}
              </a>
              for tax calculations. These tools together provide a complete
              suite for eCommerce business planning.
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
          <p className="text-xs mt-1 text-muted-foreground">
            Over 10,000 calculations daily
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <Image
            src="https://res.cloudinary.com/djiki7tvo/image/upload/v1743084283/website-redesign_kex22a.webp"
            alt="Best Web Development Company in Bangalore"
            width={500}
            height={300}
            className="w-full rounded-lg mb-3"
          />
          <h3 className="font-medium text-xl mb-2">
            Best Web Development Company in Bangalore
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
            </div>
            <span className="text-sm font-medium">4.8</span>
            <Link
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline ml-2"
            >
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
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                        >
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
                        <div
                          className="h-2 bg-[#00b67a] rounded-full"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm mb-4">
            🎯 We build your business into a Brand. 🌐 Helping Businesses
            Increase Leads, Traffic & Sales!. 🚀 Google, Bing Rank Your Web Page
            in Just 4 Hours!. 🚀 Web Design | Digital Marketing | SEO, SEM, SMM
            | Google, Meta Ads | Branding
          </p>
          <Link
            href="https://www.organicads.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="w-full bg-primary text-white font-medium py-2 rounded-md hover:bg-primary/90 transition">
              Check details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
