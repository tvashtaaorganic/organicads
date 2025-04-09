"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import JsBarcode from "jsbarcode";
import qrcode from "qrcode-generator";
import Quagga from "quagga";
import html2canvas from "html2canvas";


export default function BarcodePage() {
  const [mode, setMode] = useState("generator"); // "generator" or "scanner"
  const [darkMode, setDarkMode] = useState(false);
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [barcodeData, setBarcodeData] = useState("");
  const [barcodeSize, setBarcodeSize] = useState(200);
  const [dataError, setDataError] = useState(""); // To display data validation errors
  const barcodeCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const [scannedData, setScannedData] = useState("");
  const [productDetails, setProductDetails] = useState(null);
  const [cameraError, setCameraError] = useState(""); // To display camera errors
  const quaggaInitialized = useRef(false); // Track Quagga initialization state

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Validate barcode data based on type
  const validateBarcodeData = (type, data) => {
    if (!data.trim()) {
      return "Barcode data cannot be empty.";
    }

    switch (type) {
      case "UPC-A":
        if (!/^\d{12}$/.test(data)) {
          return "UPC-A requires exactly 12 digits.";
        }
        break;
      case "UPC-E":
        if (!/^\d{6,8}$/.test(data)) {
          return "UPC-E requires 6 to 8 digits.";
        }
        break;
      case "EAN-13":
        if (!/^\d{13}$/.test(data)) {
          return "EAN-13 requires exactly 13 digits.";
        }
        break;
      case "EAN-8":
        if (!/^\d{8}$/.test(data)) {
          return "EAN-8 requires exactly 8 digits.";
        }
        break;
      case "CODE39":
        if (!/^[A-Z0-9\-.\s$\/+%*]+$/.test(data)) {
          return "CODE39 supports uppercase letters, numbers, and special characters (- . $ / + % *).";
        }
        break;
      case "CODE128":
        // CODE128 supports most ASCII characters, so minimal validation
        if (data.length > 80) {
          return "CODE128 data should not exceed 80 characters.";
        }
        break;
      case "ISBN":
        if (!/^\d{10}|\d{13}$/.test(data.replace(/-/g, ""))) {
          return "ISBN requires 10 or 13 digits (hyphens optional).";
        }
        break;
      case "QR":
        // QR codes can contain almost any data, so minimal validation
        if (data.length > 2000) {
          return "QR Code data should not exceed 2000 characters.";
        }
        break;
      default:
        return "Unsupported barcode type.";
    }
    return "";
  };

  // Generate Barcode
  useEffect(() => {
    if (!barcodeData.trim() || !barcodeCanvasRef.current) {
      setDataError("Please enter barcode data.");
      return;
    }

    // Validate data
    const validationError = validateBarcodeData(barcodeType, barcodeData);
    if (validationError) {
      setDataError(validationError);
      return;
    }
    setDataError("");

    const canvas = barcodeCanvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ensure canvas dimensions are set before rendering
    canvas.width = barcodeSize;
    canvas.height = barcodeSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (barcodeType === "QR") {
      const qr = qrcode(0, "L");
      qr.addData(barcodeData);
      qr.make();
      const qrSvg = qr.createSvgTag({ scalable: true });
      const svgBlob = new Blob([qrSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, barcodeSize, barcodeSize);
      };
    } else {
      try {
        JsBarcode(canvas, barcodeData, {
          format: barcodeType,
          width: barcodeSize / 100,
          height: barcodeSize,
          displayValue: true,
        });
      } catch (error) {
        console.error("JsBarcode rendering error:", error);
        setDataError("Failed to generate barcode. Please check the data format.");
      }
    }
  }, [barcodeData, barcodeType, barcodeSize]);

  // Barcode Scanner with Quagga
  const startScanner = async () => {
    setCameraError("");
    setScannedData("");
    setProductDetails(null);

    try {
      // Check camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (!stream) {
        setCameraError("Camera access denied. Please grant permission to use the camera.");
        return;
      }

      // Stop any existing Quagga instance
      if (quaggaInitialized.current) {
        try {
          Quagga.stop();
        } catch (err) {
          console.error("Quagga stop error:", err);
        }
      }

      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: videoRef.current,
            constraints: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "environment", // Prefer rear camera
            },
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
              "code_39_reader",
            ],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error("Quagga init error:", err);
            setCameraError("Failed to initialize scanner: " + err.message);
            return;
          }
          Quagga.start();
          quaggaInitialized.current = true;
        }
      );

      Quagga.onDetected((result) => {
        if (result.codeResult) {
          const scannedCode = result.codeResult.code;
          setScannedData(scannedCode);
          Quagga.stop();
          quaggaInitialized.current = false;

          // Set mock product details
          setProductDetails({
            barcode: scannedCode,
            name: "Sample Product",
            brand: "Sample Brand",
            price: "$19.99",
            category: "Electronics",
            description: "This is a sample product description.",
          });
        }
      });
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied. Please grant permission to use the camera.");
    }
  };

  const stopScanner = () => {
    if (quaggaInitialized.current) {
      try {
        Quagga.stop();
        quaggaInitialized.current = false;
      } catch (err) {
        console.error("Quagga stop error:", err);
      }
    }
    setScannedData("");
    setProductDetails(null);
    setCameraError("");
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scannedData);
  };

  const searchProduct = (platform) => {
    if (!scannedData) return;
    const url =
      platform === "google"
        ? `https://www.google.com/search?q=${encodeURIComponent(scannedData)}`
        : `https://www.amazon.com/s?k=${encodeURIComponent(scannedData)}`;
    window.open(url, "_blank");
  };

  // Download Barcode (PNG only)
  const downloadBarcode = () => {
    if (!barcodeCanvasRef.current) return;

    html2canvas(barcodeCanvasRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = "barcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? "dark bg-gray-900" : "bg-gray-100"}`}>
      <div className="max-w-md mx-auto">
        {/* Dark Mode Toggle */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Barcode Generator & Scanner</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </div>

        {/* Tabs for Generator and Scanner */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => {
              setMode("generator");
              stopScanner();
            }}
            variant={mode === "generator" ? "default" : "outline"}
          >
            Generator
          </Button>
          <Button
            onClick={() => {
              setMode("scanner");
              startScanner();
            }}
            variant={mode === "scanner" ? "default" : "outline"}
          >
            Scanner
          </Button>
        </div>

        {/* Barcode Generator */}
        {mode === "generator" && (
          <Card className="dark:bg-gray-800 dark:text-gray-100">
            <CardHeader>
              <CardTitle>Barcode Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="barcode-type">Barcode Type</Label>
                  <Select value={barcodeType} onValueChange={setBarcodeType}>
                    <SelectTrigger id="barcode-type">
                      <SelectValue placeholder="Select Barcode Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPC-A">UPC-A</SelectItem>
                      <SelectItem value="UPC-E">UPC-E</SelectItem>
                      <SelectItem value="EAN-13">EAN-13</SelectItem>
                      <SelectItem value="EAN-8">EAN-8</SelectItem>
                      <SelectItem value="QR">QR Code</SelectItem>
                      <SelectItem value="CODE39">Code 39</SelectItem>
                      <SelectItem value="CODE128">Code 128</SelectItem>
                      <SelectItem value="ISBN">ISBN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="barcode-data">Barcode Data</Label>
                  <Input
                    id="barcode-data"
                    type="text"
                    value={barcodeData}
                    onChange={(e) => setBarcodeData(e.target.value)}
                    placeholder="Enter barcode data"
                  />
                </div>
              </div>

              {dataError && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">{dataError}</p>
              )}

              <div className="mb-4">
                <Label htmlFor="barcode-size">Barcode Size</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="barcode-size"
                    value={[barcodeSize]}
                    onValueChange={(value) => setBarcodeSize(value[0])}
                    min={100}
                    max={500}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{barcodeSize}px</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mb-4">
                <Button onClick={() => setBarcodeData("")} variant="outline">
                  Reset
                </Button>
                <Button onClick={downloadBarcode} className="bg-blue-600 text-white">
                  Download PNG
                </Button>
              </div>

              <div className="flex justify-center mb-4">
                <canvas ref={barcodeCanvasRef}></canvas>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barcode Scanner */}
        {mode === "scanner" && (
          <Card className="dark:bg-gray-800 dark:text-gray-100">
            <CardHeader>
              <CardTitle>Barcode Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <video ref={videoRef} className="w-full rounded-md" autoPlay playsInline />
              </div>
              {cameraError && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">{cameraError}</p>
              )}
              {scannedData && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Scanned Data:</p>
                  <p className="text-lg font-medium">{scannedData}</p>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
                    <Button onClick={() => searchProduct("google")}>Search on Google</Button>
                    <Button onClick={() => searchProduct("amazon")}>Search on Amazon</Button>
                  </div>
                </div>
              )}
              {productDetails && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attribute</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Barcode</TableCell>
                        <TableCell>{productDetails.barcode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>{productDetails.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Brand</TableCell>
                        <TableCell>{productDetails.brand}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Price</TableCell>
                        <TableCell>{productDetails.price}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>{productDetails.category}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>{productDetails.description}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              <Button onClick={stopScanner} variant="outline" className="mt-4">
                Stop Scanner, Reset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}