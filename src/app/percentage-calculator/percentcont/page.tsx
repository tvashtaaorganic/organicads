"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";


export default function PercentageCalculator() {
  const [whatIsX, setWhatIsX] = useState("");
  const [whatIsY, setWhatIsY] = useState("");
  const [whatIsResult, setWhatIsResult] = useState("");

  const [isWhatX, setIsWhatX] = useState("");
  const [isWhatY, setIsWhatY] = useState("");
  const [isWhatResult, setIsWhatResult] = useState("");

  const [changeFrom, setChangeFrom] = useState("");
  const [changeTo, setChangeTo] = useState("");
  const [changeResult, setChangeResult] = useState("");

  const validateInput = (value) => {
    return value === "" || (Number(value) > 0 && !isNaN(value));
  };

  const handleWhatIsXChange = (e) => {
    const value = e.target.value;
    if (validateInput(value)) {
      setWhatIsX(value);
      calculateWhatIs(value, whatIsY);
    }
  };

  const handleWhatIsYChange = (e) => {
    const value = e.target.value;
    if (validateInput(value)) {
      setWhatIsY(value);
      calculateWhatIs(whatIsX, value);
    }
  };

  const calculateWhatIs = (x, y) => {
    if (x !== "" && y !== "") {
      const result = (Number(x) * Number(y)) / 100;
      setWhatIsResult(result.toFixed(2));
    } else {
      setWhatIsResult("");
    }
  };

  const handleIsWhatXChange = (e) => {
    const value = e.target.value;
    if (validateInput(value)) {
      setIsWhatX(value);
      calculateIsWhat(value, isWhatY);
    }
  };

  const handleIsWhatYChange = (e) => {
    const value = e.target.value;
    if (validateInput(value)) {
      setIsWhatY(value);
      calculateIsWhat(isWhatX, value);
    }
  };

  const calculateIsWhat = (x, y) => {
    if (x !== "" && y !== "") {
      const result = (Number(x) / Number(y)) * 100;
      setIsWhatResult(result.toFixed(2));
    } else {
      setIsWhatResult("");
    }
  };

  const handleChangeFromChange = (e) => {
    const value = e.target.value;
    if (validateInput(value)) {
      setChangeFrom(value);
      calculateChange(value, changeTo);
    }
  };

  const handleChangeToChange = (e) => {
    const value = e.target.value;
    if (validateInput(value)) {
      setChangeTo(value);
      calculateChange(changeFrom, value);
    }
  };

  const calculateChange = (from, to) => {
    if (from !== "" && to !== "") {
      const result = ((Number(to) - Number(from)) / Number(from)) * 100;
      setChangeResult(result.toFixed(2));
    } else {
      setChangeResult("");
    }
  };

  const resetFields = () => {
    setWhatIsX("");
    setWhatIsY("");
    setWhatIsResult("");
    setIsWhatX("");
    setIsWhatY("");
    setIsWhatResult("");
    setChangeFrom("");
    setChangeTo("");
    setChangeResult("");
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">Percentage Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          
        <div className="space-y-6">
  {/* What is X % of Y */}
  <div className="bg-white p-4 rounded-lg border">
    <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center gap-2 w-full">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">What is</span>
      <Input
        type="text"
        value={whatIsX}
        onChange={handleWhatIsXChange}
        placeholder="X"
        className="w-full sm:w-auto sm:min-w-[80px]"
      />
      <span className="text-sm font-medium text-gray-700">%</span>
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">of</span>
      <Input
        type="text"
        value={whatIsY}
        onChange={handleWhatIsYChange}
        placeholder="Y"
        className="w-full sm:w-auto sm:min-w-[80px]"
      />
      <span className="text-sm font-medium text-gray-700">=</span>
      <Input
        type="text"
        value={whatIsResult}
        readOnly
        className="w-full sm:w-auto sm:min-w-[80px] bg-gray-100"
      />
    </div>
  </div>

  {/* X is what % of Y */}
  <div className="bg-white p-4 rounded-lg border">
    <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center gap-2 w-full">
      <Input
        type="text"
        value={isWhatX}
        onChange={handleIsWhatXChange}
        placeholder="X"
        className="w-full sm:w-auto sm:min-w-[80px]"
      />
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">is what % of</span>
      <Input
        type="text"
        value={isWhatY}
        onChange={handleIsWhatYChange}
        placeholder="Y"
        className="w-full sm:w-auto sm:min-w-[80px]"
      />
      <span className="text-sm font-medium text-gray-700">=</span>
      <div className="relative w-full sm:w-auto sm:min-w-[80px]">
        <Input
          type="text"
          value={isWhatResult ? `${isWhatResult}%` : ""}
          readOnly
          className="w-full bg-gray-100"
        />
      </div>
    </div>
  </div>

  {/* % change from Origin to New */}
  <div className="bg-white p-4 rounded-lg border">
    <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center gap-2 w-full">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">% change from</span>
      <Input
        type="text"
        value={changeFrom}
        onChange={handleChangeFromChange}
        placeholder="Origin"
        className="w-full sm:w-auto sm:min-w-[80px]"
      />
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">to</span>
      <Input
        type="text"
        value={changeTo}
        onChange={handleChangeToChange}
        placeholder="New"
        className="w-full sm:w-auto sm:min-w-[80px]"
      />
      <span className="text-sm font-medium text-gray-700">=</span>
      <div className="relative w-full sm:w-auto sm:min-w-[80px]">
        <Input
          type="text"
          value={changeResult ? `${changeResult}%` : ""}
          readOnly
          className={`w-full bg-gray-100 ${
            changeResult && Number(changeResult) < 0
              ? "text-red-500"
              : changeResult && Number(changeResult) >= 0
              ? "text-green-500"
              : ""
          }`}
        />
      </div>
    </div>
  </div>
        </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
             <Button onClick={resetFields} className="w-full mt-4 bg-black">
              Reset
            </Button>
          </div>
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

    <div className="mt-12 prose max-w-none opacity-100">
      <h2 className="text-2xl font-semibold mb-4">About Real Estate Area Calculator</h2>
      <div className="space-y-4">
        <p>
          Our Real Estate Area Calculator is a comprehensive tool designed to help real estate
          professionals, property buyers, and sellers convert between different units of land
          measurement. It supports both international and local Indian units, making it particularly
          useful for property transactions across different regions.
        </p>
        <h3 className="text-xl font-medium">Features:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Multiple Unit Conversions:</strong> Convert between square feet, square meters,
            square yards, acres, hectares, grounds, and cents.
          </li>
          <li>
            <strong>Instant Calculations:</strong> See conversions update in real-time as you type.
          </li>
          <li>
            <strong>Indian Units:</strong> Support for local units like grounds and cents.
          </li>
          <li>
            <strong>Precise Results:</strong> Accurate calculations with decimal support.
          </li>
        </ul>
        <h3 className="text-xl font-medium">Common Uses:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Real estate property measurements</li>
          <li>Land area calculations</li>
          <li>Property documentation</li>
          <li>Construction planning</li>
          <li>Agricultural land measurement</li>
        </ul>
        <h3 className="text-xl font-medium">Unit Explanations:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Square Feet (ft²):</strong> Standard unit in many countries.
          </li>
          <li>
            <strong>Square Meters (m²):</strong> International standard unit.
          </li>
          <li>
            <strong>Square Yards (yd²):</strong> Common in UK and India.
          </li>
          <li>
            <strong>Acres:</strong> Larger land measurement (1 acre = 43,560 sq ft).
          </li>
          <li>
            <strong>Hectares:</strong> Metric unit (1 hectare = 10,000 sq m).
          </li>
          <li>
            <strong>Grounds:</strong> Common in South India (1 ground = 2,400 sq ft).
          </li>
          <li>
            <strong>Cents:</strong> Common in Kerala (1 cent = 435.6 sq ft).
          </li>
        </ul>
        <h3 className="text-xl font-medium">How to Use:</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter a value in any unit field.</li>
          <li>See instant conversions to all other units.</li>
          <li>Use Reset to clear all values.</li>
          <li>Copy the converted values as needed.</li>
        </ol>
        <p>
          This calculator is particularly useful for real estate transactions where different
          parties might use different units of measurement. It helps avoid confusion and ensures
          accurate communication of property sizes across different measurement systems.
        </p>
      </div>
    </div>

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