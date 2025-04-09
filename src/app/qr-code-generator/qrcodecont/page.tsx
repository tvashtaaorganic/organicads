"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import QRCodeStyling from "qr-code-styling";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import Link from "next/link";
import { Download, RefreshCcw } from 'lucide-react';

export default function QRCodeGenerator() {
  const [type, setType] = useState("url"); // QR code type
  const [data, setData] = useState({
    url: "",
    text: "",
    vcard: { name: "", phone: "", email: "" },
    social: { platform: "instagram", link: "" },
    email: { address: "", subject: "", body: "" },
    sms: { number: "", message: "" },
    payment: { platform: "upi", link: "" },
  });
  const [qrSize, setQrSize] = useState(200); // Default size: 200px
  const [qrColor, setQrColor] = useState("#000000"); // Default color: black
  const [qrStyle, setQrStyle] = useState("squares"); // Default style: squares
  const [logo, setLogo] = useState(null); // Logo file
  const qrCodeRef = useRef(null);
  const qrCodeInstance = useRef(null);

  // Initialize QRCodeStyling instance
  useEffect(() => {
    qrCodeInstance.current = new QRCodeStyling({
      width: qrSize,
      height: qrSize,
      type: "canvas",
      dotsOptions: {
        color: qrColor,
        type: qrStyle,
      },
      image: logo ? URL.createObjectURL(logo) : undefined,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      },
    });

    return () => {
      if (qrCodeInstance.current) {
        qrCodeInstance.current = null;
      }
    };
  }, []);

  // Update QR code when data, size, color, style, or logo changes
  useEffect(() => {
    if (!qrCodeInstance.current) return;

    let qrData = "";
    switch (type) {
      case "url":
        qrData = data.url;
        break;
      case "text":
        qrData = data.text;
        break;
      case "vcard":
        qrData = `BEGIN:VCARD\nVERSION:3.0\nFN:${data.vcard.name}\nTEL:${data.vcard.phone}\nEMAIL:${data.vcard.email}\nEND:VCARD`;
        break;
      case "social":
        qrData = data.social.link;
        break;
      case "email":
        qrData = `mailto:${data.email.address}?subject=${encodeURIComponent(data.email.subject)}&body=${encodeURIComponent(data.email.body)}`;
        break;
      case "sms":
        qrData = `sms:${data.sms.number}?body=${encodeURIComponent(data.sms.message)}`;
        break;
      case "payment":
        qrData = data.payment.link;
        break;
      default:
        qrData = "";
    }

    if (!qrData.trim()) {
      qrCodeInstance.current.update({ data: "" });
      return;
    }

    qrCodeInstance.current.update({
      data: qrData,
      width: qrSize,
      height: qrSize,
      dotsOptions: {
        color: qrColor,
        type: qrStyle,
      },
      image: logo ? URL.createObjectURL(logo) : undefined,
    });

    qrCodeInstance.current.append(qrCodeRef.current);
  }, [type, data, qrSize, qrColor, qrStyle, logo]);

  const resetFields = () => {
    setType("url");
    setData({
      url: "",
      text: "",
      wifi: { ssid: "", password: "" },
      vcard: { name: "", phone: "", email: "" },
      social: { platform: "instagram", link: "" },
      email: { address: "", subject: "", body: "" },
      sms: { number: "", message: "" },
      payment: { platform: "upi", link: "" },
    });
    setQrSize(200);
    setQrColor("#000000");
    setQrStyle("squares");
    setLogo(null);
  };

  const downloadQRCode = (format) => {
    if (!qrCodeInstance.current) return;

    if (format === "png") {
      qrCodeInstance.current.download({ name: "qrcode", extension: "png" });
    } else if (format === "svg") {
      qrCodeInstance.current.download({ name: "qrcode", extension: "svg" });
    } else if (format === "pdf") {
      html2canvas(qrCodeRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        pdf.addImage(imgData, "PNG", 10, 10, qrSize / 4, qrSize / 4); // Adjust size for PDF
        pdf.save("qrcode.pdf");
      });
    }
  };


  const handleLogoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setLogo(file);
    }
  };

  const handleLogoDragOver = (e) => {
    e.preventDefault();
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">QR Code Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-700">Generate QR Code How You Want</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Type and Input in a Single Row */}
          <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4 w-full">
            <div>
              <Label htmlFor="qr-type" className="mb-2">QR Code Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="qr-type" className="w-full">
                  <SelectValue placeholder="Select QR Code Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Website URL</SelectItem>
                  <SelectItem value="text">Text/Message</SelectItem>
                  <SelectItem value="vcard">Contact Information (vCard)</SelectItem>
                  <SelectItem value="social">Social Media Link</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="payment">Payment Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Input Fields Based on Type */}
            {type === "url" && (
              <div>
                <Label htmlFor="url" className="mb-2">Website URL</Label>
                <Input
                  id="url"
                  type="text"
                  value={data.url}
                  onChange={(e) => setData({ ...data, url: e.target.value })}
                  placeholder="Enter URL (e.g., organicads.in)"
                />
              </div>
            )}
            {type === "text" && (
              <div>
                <Label htmlFor="text" className="mb-2">Text/Message</Label>
                <Input
                  id="text"
                  type="text"
                  value={data.text}
                  onChange={(e) => setData({ ...data, text: e.target.value })}
                  placeholder="Enter text or message"
                />
              </div>
            )}
           
            {type === "vcard" && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="vcard-name" className="mb-2">Name</Label>
                  <Input
                    id="vcard-name"
                    type="text"
                    value={data.vcard.name}
                    onChange={(e) => setData({ ...data, vcard: { ...data.vcard, name: e.target.value } })}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-phone" className="mb-2">Phone</Label>
                  <Input
                    id="vcard-phone"
                    type="text"
                    value={data.vcard.phone}
                    onChange={(e) => setData({ ...data, vcard: { ...data.vcard, phone: e.target.value } })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-email" className="mb-2">Email</Label>
                  <Input
                    id="vcard-email"
                    type="email"
                    value={data.vcard.email}
                    onChange={(e) => setData({ ...data, vcard: { ...data.vcard, email: e.target.value } })}
                    placeholder="Enter email"
                  />
                </div>
              </div>
            )}
            {type === "social" && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="social-platform" className="mb-2">Platform</Label>
                  <Select
                    value={data.social.platform}
                    onValueChange={(value) => setData({ ...data, social: { ...data.social, platform: value } })}
                  >
                    <SelectTrigger id="social-platform">
                      <SelectValue placeholder="Select Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="social-link" className="mb-2">Link</Label>
                  <Input
                    id="social-link"
                    type="text"
                    value={data.social.link}
                    onChange={(e) => setData({ ...data, social: { ...data.social, link: e.target.value } })}
                    placeholder="Enter social media link"
                  />
                </div>
              </div>
            )}
            {type === "email" && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="email-address" className="mb-2">Email Address</Label>
                  <Input
                    id="email-address"
                    type="email"
                    value={data.email.address}
                    onChange={(e) => setData({ ...data, email: { ...data.email, address: e.target.value } })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="email-subject" className="mb-2">Subject</Label>
                  <Input
                    id="email-subject"
                    type="text"
                    value={data.email.subject}
                    onChange={(e) => setData({ ...data, email: { ...data.email, subject: e.target.value } })}
                    placeholder="Enter email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="email-body" className="mb-2">Body</Label>
                  <Input
                    id="email-body"
                    type="text"
                    value={data.email.body}
                    onChange={(e) => setData({ ...data, email: { ...data.email, body: e.target.value } })}
                    placeholder="Enter email body"
                  />
                </div>
              </div>
            )}
            {type === "sms" && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="sms-number" className="mb-2">Phone Number</Label>
                  <Input
                    id="sms-number"
                    type="text"
                    value={data.sms.number}
                    onChange={(e) => setData({ ...data, sms: { ...data.sms, number: e.target.value } })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="sms-message" className="mb-2">Message</Label>
                  <Input
                    id="sms-message"
                    type="text"
                    value={data.sms.message}
                    onChange={(e) => setData({ ...data, sms: { ...data.sms, message: e.target.value } })}
                    placeholder="Enter SMS message"
                  />
                </div>
              </div>
            )}
            {type === "payment" && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="payment-platform" className="mb-2">Platform</Label>
                  <Select
                    value={data.payment.platform}
                    onValueChange={(value) => setData({ ...data, payment: { ...data.payment, platform: value } })}
                  >
                    <SelectTrigger id="payment-platform">
                      <SelectValue placeholder="Select Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-link" className="mb-2">Payment Link</Label>
                  <Input
                    id="payment-link"
                    type="text"
                    value={data.payment.link}
                    onChange={(e) => setData({ ...data, payment: { ...data.payment, link: e.target.value } })}
                    placeholder="Enter payment link"
                  />
                </div>
              </div>
            )}
          </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
          {/* QR Code Size, Color, and Style in a Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <Label htmlFor="qr-size" className="mb-2">QR Code Size</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="qr-size"
                  value={[qrSize]}
                  onValueChange={(value) => setQrSize(value[0])}
                  min={100}
                  max={500}
                  step={10}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">{qrSize}px</span>
              </div>
            </div>

            <div>
              <Label htmlFor="qr-color" className="mb-2">QR Code Color</Label>
              <Input
                id="qr-color"
                type="color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-full h-10"
              />
            </div>

            <div>
              <Label htmlFor="qr-style" className="mb-2">QR Code Style</Label>
              <Select value={qrStyle} onValueChange={setQrStyle}>
                <SelectTrigger id="qr-style" className="w-full">
                  <SelectValue placeholder="Select Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="squares">Squares</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-4">
            <Label className="mb-2">Upload Logo</Label>
            <div
              className="border-2 border-dashed border-gray-300 p-4 text-center rounded-md"
              onDrop={handleLogoDrop}
              onDragOver={handleLogoDragOver}
            >
              <p className="text-sm text-gray-600">
                Drag & drop your logo here or{" "}
                <label className="text-blue-600 cursor-pointer">
                  click to upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setLogo(e.target.files[0])}
                  />
                </label>
              </p>
              {logo && <p className="text-sm text-gray-600 mt-2">Logo: {logo.name}</p>}
            </div>
          </div>

          {/* Reset and Download Buttons */}
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            <Button onClick={resetFields} variant="outline">
            <RefreshCcw /> Reset
            </Button>
            <Button onClick={() => downloadQRCode("png")} className="bg-blue-600 text-white">
            <Download /> Download 
            </Button>
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center" ref={qrCodeRef}></div>
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