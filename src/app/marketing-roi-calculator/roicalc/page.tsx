"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Calculator, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function RoiCalculator() {
  const [channels, setChannels] = useState([
    { id: 1, name: "", revenue: "", cost: "", conversions: "", roi: "", cpc: "" },
  ]);
  const [currency, setCurrency] = useState("INR");
  const [warning, setWarning] = useState(""); // State for warning message

  // Function to add a new channel/project
  const addChannel = () => {
    setChannels([
      ...channels,
      { id: channels.length + 1, name: "", revenue: "", cost: "", conversions: "", roi: "", cpc: "" },
    ]);
    setWarning(""); // Clear warning when adding a new channel
  };

  // Function to delete a channel/project
  const deleteChannel = (id) => {
    setChannels(channels.filter((channel) => channel.id !== id));
    setWarning(""); // Clear warning when deleting a channel
  };

  // Function to update channel data
  const updateChannel = (id, field, value) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id ? { ...channel, [field]: value } : channel
      )
    );
    setWarning(""); // Clear warning when user starts typing
  };

  // Function to validate inputs
  const validateInputs = () => {
    // Check if all channels have empty revenue, cost, and conversions
    const allEmpty = channels.every(
      (channel) =>
        (!channel.revenue || channel.revenue === "") &&
        (!channel.cost || channel.cost === "") &&
        (!channel.conversions || channel.conversions === "")
    );

    if (allEmpty) {
      setWarning("Please enter values for at least one channel/project.");
      return false;
    }
    return true;
  };

  // Function to calculate ROI and CPC
  const calculateRomi = () => {
    if (!validateInputs()) {
      return; // Stop calculation if validation fails
    }

    setWarning(""); // Clear warning if validation passes
    setChannels(
      channels.map((channel) => {
        const revenue = parseFloat(channel.revenue) || 0;
        const cost = parseFloat(channel.cost) || 0;
        const conversions = parseFloat(channel.conversions) || 0;

        // Calculate ROI: ((Revenue - Cost) / Cost) * 100
        const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
        // Calculate CPC: Cost / Conversions
        const cpc = conversions > 0 ? cost / conversions : 0;

        return { ...channel, roi: roi.toFixed(2), cpc: cpc.toFixed(2) };
      })
    );
  };

  // Function to reset the table
  const resetTable = () => {
    setChannels([
      { id: 1, name: "", revenue: "", cost: "", conversions: "", roi: "", cpc: "" },
    ]);
    setWarning(""); // Clear warning on reset
  };

  // Function to copy the entire table data
  const copyTable = () => {
    const tableData = channels.map((channel) => ({
      "Channel/Project": channel.name || "N/A",
      "Total Revenue": channel.revenue || "0",
      "Marketing Cost": channel.cost || "0",
      Conversions: channel.conversions || "0",
      ROI: channel.roi ? `${channel.roi}%` : "N/A",
      CPC: channel.cpc || "N/A",
    }));
    navigator.clipboard.writeText(JSON.stringify(tableData, null, 2));
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
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-center sm:text-left">Marketing ROI Calculator</h1>
            <div className="flex items-center space-x-2">
              <span>Currency:</span>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Warning Message */}
          {warning && (
            <div className="mb-4 p-3 text-red-500 rounded-lg text-center">
              {warning}
            </div>
          )}

          {/* Desktop View: Table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gray-800 text-white">Channels / Projects</TableHead>
                  <TableHead className="bg-gray-800 text-white">Total Revenue</TableHead>
                  <TableHead className="bg-gray-800 text-white">Marketing Cost</TableHead>
                  <TableHead className="bg-gray-800 text-white">Conversions</TableHead>
                  <TableHead className="bg-gray-800 text-white">ROI</TableHead>
                  <TableHead className="bg-gray-800 text-white">CPC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell>
                      <Input
                        value={channel.name}
                        onChange={(e) => updateChannel(channel.id, "name", e.target.value)} // Fixed typo here: ruralChannel -> updateChannel
                        placeholder="Ex. Google Ads"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={channel.revenue}
                        onChange={(e) => updateChannel(channel.id, "revenue", e.target.value)}
                        placeholder="Ex. 1234"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={channel.cost}
                        onChange={(e) => updateChannel(channel.id, "cost", e.target.value)}
                        placeholder="Ex. 1234"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={channel.conversions}
                        onChange={(e) => updateChannel(channel.id, "conversions", e.target.value)}
                        placeholder="Ex. 1234"
                      />
                    </TableCell>
                    <TableCell
                      className={`${
                        channel.roi < 0 ? "text-red-500" : channel.roi > 0 ? "text-green-500" : "text-gray-500"
                      } bg-green-100`}
                    >
                      {channel.roi ? `${channel.roi}%` : "-"}
                    </TableCell>
                    <TableCell
                      className={`${
                        channel.cpc < 0 ? "text-red-500" : channel.cpc > 0 ? "text-green-500" : "text-gray-500"
                      } bg-green-100`}
                    >
                      {channel.cpc || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() => deleteChannel(channel.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View: Card Layout */}
          <div className="block sm:hidden space-y-6">
            {channels.map((channel) => (
              <div key={channel.id} className="border rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Channel / Project</label>
                  <Input
                    value={channel.name}
                    onChange={(e) => updateChannel(channel.id, "name", e.target.value)}
                    placeholder="Ex. Google Ads"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Revenue</label>
                  <Input
                    type="number"
                    value={channel.revenue}
                    onChange={(e) => updateChannel(channel.id, "revenue", e.target.value)}
                    placeholder="Ex. 1234"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Cost</label>
                  <Input
                    type="number"
                    value={channel.cost}
                    onChange={(e) => updateChannel(channel.id, "cost", e.target.value)}
                    placeholder="Ex. 1234"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conversions</label>
                  <Input
                    type="number"
                    value={channel.conversions}
                    onChange={(e) => updateChannel(channel.id, "conversions", e.target.value)}
                    placeholder="Ex. 1234"
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ROI</label>
                    <p
                      className={`${
                        channel.roi < 0 ? "text-red-500" : channel.roi > 0 ? "text-green-500" : "text-gray-500"
                      } font-semibold`}
                    >
                      {channel.roi ? `${channel.roi}%` : "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CPC</label>
                    <p
                      className={`${
                        channel.cpc < 0 ? "text-red-500" : channel.cpc > 0 ? "text-green-500" : "text-gray-500"
                      } font-semibold`}
                    >
                      {channel.cpc || "-"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => deleteChannel(channel.id)}
                  className="text-red-500 hover:text-red-700 w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <Button onClick={addChannel} className=" bg-black text-white">
              + Add another channel/project
            </Button>
            <Button variant="outline" onClick={copyTable}>
              Copy table
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 space-x-4 mt-6 justify-center">
            <Button onClick={calculateRomi} className="bg-blue-600 text-white">
              <Calculator />Calculate ROMI
            </Button>
            <Button variant="outline" onClick={resetTable}>
              <RefreshCcw /> Reset table
            </Button>
          </div>
        </div>

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
          <h2 className="text-2xl font-semibold mb-4">
            About Date Difference Calculator
          </h2>
          <div className="space-y-4">
            <p>
              Our Date Difference Calculator is a powerful tool that helps you
              find the exact duration between any two dates. Whether you need to
              calculate project timelines, age differences, or plan events, this
              calculator provides comprehensive time-based calculations.
            </p>
            <h3 className="text-xl font-medium">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Precise Duration:</strong> Calculate exact years,
                months, and days between dates.
              </li>
              <li>
                <strong>Time Precision:</strong> Optional time inputs for more
                accurate calculations.
              </li>
              <li>
                <strong>Multiple Formats:</strong> View results in days, weeks,
                and working days.
              </li>
              <li>
                <strong>Working Days:</strong> Calculate business days excluding
                weekends.
              </li>
            </ul>
            <h3 className="text-xl font-medium">Common Uses:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Project timeline planning</li>
              <li>Contract duration calculations</li>
              <li>Event planning</li>
              <li>Age difference calculations</li>
              <li>Working days calculation</li>
              <li>Deadline management</li>
            </ul>
            <h3 className="text-xl font-medium">How to Use:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Enter the start date.</li>
              <li>Add start time (optional) for more precision.</li>
              <li>Enter the end date.</li>
              <li>Add end time (optional).</li>
              <li>Click "Calculate Difference" to see results.</li>
              <li>Use Reset to start a new calculation.</li>
            </ol>
            <p>
              The calculator automatically handles date order, so you don't need
              to worry about which date comes first. It provides comprehensive
              results including total days, weeks, working days, and weekends,
              making it useful for both personal and professional use.
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