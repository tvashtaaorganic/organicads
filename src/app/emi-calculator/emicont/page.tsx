'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const LoanEmiCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("100000");
  const [interestRate, setInterestRate] = useState("7");
  const [loanTenure, setLoanTenure] = useState("2");
  const [emi, setEmi] = useState("0.00");
  const [totalInterest, setTotalInterest] = useState("0.00");
  const [totalPayment, setTotalPayment] = useState("0.00");

  // Function to format numbers with commas in Indian style
  const formatNumber = (number) => {
    return Number(number).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate EMI whenever loanAmount, interestRate, or loanTenure changes
  useEffect(() => {
    if (!loanAmount || !interestRate || !loanTenure) {
      setEmi("0.00");
      setTotalInterest("0.00");
      setTotalPayment("0.00");
      return;
    }

    const principal = Number(loanAmount);
    const monthlyRate = Number(interestRate) / 100 / 12;
    const tenureInMonths = Number(loanTenure) * 12;

    // EMI Formula: P * r * (1 + r)^n / [(1 + r)^n - 1]
    const emiValue =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureInMonths)) /
      (Math.pow(1 + monthlyRate, tenureInMonths) - 1);

    const totalPayable = emiValue * tenureInMonths;
    const totalInterestValue = totalPayable - principal;

    // Format the values with commas
    setEmi(formatNumber(emiValue));
    setTotalInterest(formatNumber(totalInterestValue));
    setTotalPayment(formatNumber(totalPayable));
  }, [loanAmount, interestRate, loanTenure]);

  // Handlers for input changes
  const handleLoanAmountChange = (e) => {
    const value = e.target.value;
    if (value >= 100000 && value <= 20000000) {
      setLoanAmount(value);
    } else if (value === "") {
      setLoanAmount("");
    }
  };

  const handleInterestRateChange = (e) => {
    const value = e.target.value;
    if (value >= 5 && value <= 20) {
      setInterestRate(value);
    } else if (value === "") {
      setInterestRate("");
    }
  };

  const handleLoanTenureChange = (e) => {
    const value = e.target.value;
    if (value >= 1 && value <= 30) {
      setLoanTenure(value);
    } else if (value === "") {
      setLoanTenure("");
    }
  };

  // Reset function
  const handleReset = () => {
    setLoanAmount("100000");
    setInterestRate("7");
    setLoanTenure("2");
  };

  const shareOnWhatsApp = () => {
    const message = `Check out this awesome Loan EMI Calculator:\n\nhttps://yourwebsite.com/loan-emi-calculator`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };
  

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Section - Calculator */}
      <div className="md:col-span-8 bg-white p-6 rounded-lg shadow-md">
       
        {/* Loan Amount */}
        
        <Card className="">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Loan EMI Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Loan Amount */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Loan Amount (₹)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm">₹</span>
              <Input
                type="number"
                value={loanAmount}
                onChange={handleLoanAmountChange}
                placeholder="Enter amount"
                className="w-32 text-right"
              />
            </div>
          </div>
          <input
            type="range"
            min="100000"
            max="20000000"
            step="100000"
            value={loanAmount || 100000}
            onChange={(e) => setLoanAmount(Number(e.target.value).toString())}
            className="w-full mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹1L</span>
            <span>₹2Cr</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Interest Rate (%)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={interestRate}
                onChange={handleInterestRateChange}
                placeholder="Enter rate"
                className="w-32 text-right"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            step="0.1"
            value={interestRate || 5}
            onChange={(e) => setInterestRate(Number(e.target.value).toString())}
            className="w-full mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>5%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Loan Tenure */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Loan Tenure (Years)</label>
            <Input
              type="number"
              value={loanTenure}
              onChange={handleLoanTenureChange}
              placeholder="Enter years"
              className="w-32 text-right"
            />
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={loanTenure || 1}
            onChange={(e) => setLoanTenure(Number(e.target.value).toString())}
            className="w-full mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 Year</span>
            <span>30 Years</span>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 bg-blue-100 rounded-md p-6">
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">Monthly EMI:</p>
            <span className="text-black text-2xl font-bold">₹{emi}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-lg font-semibold">₹{totalInterest}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Payment</p>
              <p className="text-lg font-semibold">₹{totalPayment}</p>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full mt-4 bg-black text-white py-2 rounded-md"
        >
          Reset
        </button>
      </CardContent>
    </Card>

        {/* Share on WhatsApp Button */}
        <div className="flex justify-center items-center mt-6 mb-4">
          <button onClick={shareOnWhatsApp} className="inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-6 py-2">
            Share on WhatsApp
          </button>
        </div>

        <section className="mt-12 prose max-w-none opacity-100 transform-none">
      <h2 className="text-2xl font-semibold mb-4">About Loan EMI Calculator</h2>
      <div className="space-y-4">
        <p>
          Our Loan EMI Calculator helps you plan your loans better by calculating your Equated Monthly Installments (EMI) based on the loan amount, interest rate, and tenure. This tool is essential for making informed decisions about loans and understanding your financial commitments.
        </p>
        <h3 className="text-xl font-medium">Features:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>EMI Calculation:</strong> Calculate your monthly loan payments</li>
          <li><strong>Interest Breakdown:</strong> See total interest payable</li>
          <li><strong>Loan Analysis:</strong> View total payment including principal and interest</li>
          <li><strong>Flexible Inputs:</strong> Adjust values using sliders or enter them directly</li>
        </ul>
        <h3 className="text-xl font-medium">Common Uses:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Home loan planning</li>
          <li>Car loan calculations</li>
          <li>Personal loan assessment</li>
          <li>Business loan analysis</li>
          <li>Education loan planning</li>
        </ul>
        <h3 className="text-xl font-medium">How to Use:</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter the loan amount using the slider or input field</li>
          <li>Set the interest rate</li>
          <li>Choose the loan tenure in years</li>
          <li>View your monthly EMI amount</li>
          <li>Check the total interest and payment details</li>
        </ol>
        <p>
          The calculator provides instant results as you adjust the values, helping you understand how different loan parameters affect your monthly payments. This makes it easier to choose a loan that fits your budget and financial goals.
        </p>
      </div>
    </section>
      </div>

      {/* Right Section - Quick Tips */}
      <div className="md:col-span-4 bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="bg-blue-100 rounded-lg p-4"><h3 className="font-medium text-lg mb-2">Quick Tips</h3><ul className="text-sm space-y-2"><li>• Use tab key to move between fields</li><li>• Results update automatically</li><li>• Recent calculations are saved</li></ul></div>
        <div className="bg-muted rounded-lg p-4"><h4 className="font-semibold mb-2">Calculator Stats</h4><p className="text-sm">Trusted by students and professionals</p><p className="text-xs mt-1 text-muted-foreground">Over 10,000 calculations daily</p></div>
        
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
          {Array(5).fill().map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" >
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
                {Array(5).fill().map((_, i) => (
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
};

export default LoanEmiCalculator;
