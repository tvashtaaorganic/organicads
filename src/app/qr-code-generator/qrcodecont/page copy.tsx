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

export default function QRCodeGenerator() {
  const [type, setType] = useState("url"); // QR code type
  const [data, setData] = useState({
    url: "",
    text: "",
    wifi: { ssid: "", password: "" },
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
      case "wifi":
        qrData = `WIFI:S:${data.wifi.ssid};T:WPA;P:${data.wifi.password};;`;
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

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">QR Code Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">Generate QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          {/* QR Code Type and Input in a Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="qr-type">QR Code Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="qr-type">
                  <SelectValue placeholder="Select QR Code Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Website URL</SelectItem>
                  <SelectItem value="text">Text/Message</SelectItem>
                  <SelectItem value="wifi">WiFi Credentials</SelectItem>
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
                <Label htmlFor="url">Website URL</Label>
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
                <Label htmlFor="text">Text/Message</Label>
                <Input
                  id="text"
                  type="text"
                  value={data.text}
                  onChange={(e) => setData({ ...data, text: e.target.value })}
                  placeholder="Enter text or message"
                />
              </div>
            )}
            {type === "wifi" && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="wifi-ssid">WiFi SSID</Label>
                  <Input
                    id="wifi-ssid"
                    type="text"
                    value={data.wifi.ssid}
                    onChange={(e) => setData({ ...data, wifi: { ...data.wifi, ssid: e.target.value } })}
                    placeholder="Enter WiFi SSID"
                  />
                </div>
                <div>
                  <Label htmlFor="wifi-password">WiFi Password</Label>
                  <Input
                    id="wifi-password"
                    type="text"
                    value={data.wifi.password}
                    onChange={(e) => setData({ ...data, wifi: { ...data.wifi, password: e.target.value } })}
                    placeholder="Enter WiFi Password"
                  />
                </div>
              </div>
            )}
            {type === "vcard" && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="vcard-name">Name</Label>
                  <Input
                    id="vcard-name"
                    type="text"
                    value={data.vcard.name}
                    onChange={(e) => setData({ ...data, vcard: { ...data.vcard, name: e.target.value } })}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-phone">Phone</Label>
                  <Input
                    id="vcard-phone"
                    type="text"
                    value={data.vcard.phone}
                    onChange={(e) => setData({ ...data, vcard: { ...data.vcard, phone: e.target.value } })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-email">Email</Label>
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
              <div className="space-y-2">
                <div>
                  <Label htmlFor="social-platform">Platform</Label>
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
                  <Label htmlFor="social-link">Link</Label>
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
              <div className="space-y-2">
                <div>
                  <Label htmlFor="email-address">Email Address</Label>
                  <Input
                    id="email-address"
                    type="email"
                    value={data.email.address}
                    onChange={(e) => setData({ ...data, email: { ...data.email, address: e.target.value } })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input
                    id="email-subject"
                    type="text"
                    value={data.email.subject}
                    onChange={(e) => setData({ ...data, email: { ...data.email, subject: e.target.value } })}
                    placeholder="Enter email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="email-body">Body</Label>
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
              <div className="space-y-2">
                <div>
                  <Label htmlFor="sms-number">Phone Number</Label>
                  <Input
                    id="sms-number"
                    type="text"
                    value={data.sms.number}
                    onChange={(e) => setData({ ...data, sms: { ...data.sms, number: e.target.value } })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="sms-message">Message</Label>
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
              <div className="space-y-2">
                <div>
                  <Label htmlFor="payment-platform">Platform</Label>
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
                  <Label htmlFor="payment-link">Payment Link</Label>
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

          {/* QR Code Size, Color, and Style in a Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="qr-size">QR Code Size</Label>
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
              <Label htmlFor="qr-color">QR Code Color</Label>
              <Input
                id="qr-color"
                type="color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-full h-10"
              />
            </div>

            <div>
              <Label htmlFor="qr-style">QR Code Style</Label>
              <Select value={qrStyle} onValueChange={setQrStyle}>
                <SelectTrigger id="qr-style">
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

          {/* Logo Upload */}
          <div className="mb-4">
            <Label>Upload Logo</Label>
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
              Reset
            </Button>
            <Button onClick={() => downloadQRCode("png")} className="bg-blue-600 text-white">
              Download 
            </Button>
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center" ref={qrCodeRef}></div>
        </CardContent>
      </Card>
    </div>
  );
}