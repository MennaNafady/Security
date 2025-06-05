import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Lock,
  Unlock,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Shield,
  RotateCw,
  Cpu,
} from "lucide-react";
import CryptoJS from "crypto-js";

export default function EncryptionApp() {
  // Main state
  const [mode, setMode] = useState("encrypt");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [showIntermediateResults, setShowIntermediateResults] = useState(false);
  const [intermediateResults, setIntermediateResults] = useState<
    { algorithm: string; input: string; output: string }[]
  >([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Algorithm selection and ordering
  const [algorithms, setAlgorithms] = useState([
    {
      id: "aes",
      name: "AES",
      enabled: true,
      key: "my-secret-key",
      order: 1,
      expanded: false,
    },
    {
      id: "vigenere",
      name: "Vigenère",
      enabled: false,
      key: "CIPHER",
      order: 2,
      expanded: false,
    },
    {
      id: "railfence",
      name: "Rail Fence",
      enabled: false,
      rails: 3,
      order: 3,
      expanded: false,
    },
  ]);

  // Helper function to clear notifications after some time
  const clearNotifications = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);
  };

  // Toggle algorithm selection
  const toggleAlgorithm = (id: string) => {
    setAlgorithms(
      algorithms.map((algo) =>
        algo.id === id ? { ...algo, enabled: !algo.enabled } : algo
      )
    );
  };

  // Toggle algorithm expanded state
  const toggleExpanded = (id: string) => {
    setAlgorithms(
      algorithms.map((algo) =>
        algo.id === id ? { ...algo, expanded: !algo.expanded } : algo
      )
    );
  };

  // Update algorithm order
  const moveAlgorithm = (id: string, direction: "up" | "down") => {
    const sortedAlgos = [...algorithms].sort((a, b) => a.order - b.order);
    const index = sortedAlgos.findIndex((algo) => algo.id === id);

    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sortedAlgos.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;

    const updatedAlgos = [...sortedAlgos];
    [updatedAlgos[index].order, updatedAlgos[newIndex].order] = [
      updatedAlgos[newIndex].order,
      updatedAlgos[index].order,
    ];

    setAlgorithms(updatedAlgos);
  };

  // Update algorithm parameters
  const updateAlgorithmParam = (
    id: string,
    param: string,
    value: string | number
  ) => {
    setAlgorithms(
      algorithms.map((algo) =>
        algo.id === id ? { ...algo, [param]: value } : algo
      )
    );
  };

  // AES Encryption
  const aesEncrypt = (text: string, key: string) => {
    try {
      return CryptoJS.AES.encrypt(text, key).toString();
    } catch (err: any) {
      throw new Error(`AES encryption failed: ${err.message}`);
    }
  };

  // AES Decryption
  const aesDecrypt = (text: string, key: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(text, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err: any) {
      throw new Error(`AES decryption failed: ${err.message}`);
    }
  };

  // Vigenere Encryption
  const vigenereEncrypt = (text: string, key: string) => {
    if (!key) return text;
    let result = "";
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (/[A-Za-z]/.test(char)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const keyChar = key[keyIndex % key.length].toUpperCase();
        const keyCode = keyChar.charCodeAt(0) - 65;
        const encryptedCode = (charCode + keyCode) % 26;
        const encryptedChar = String.fromCharCode(encryptedCode + 65);

        result += isUpperCase ? encryptedChar : encryptedChar.toLowerCase();
        keyIndex++;
      } else {
        result += char;
      }
    }

    return result;
  };

  // Vigenere Decryption
  const vigenereDecrypt = (text: string, key: string) => {
    if (!key) return text;
    let result = "";
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (/[A-Za-z]/.test(char)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const keyChar = key[keyIndex % key.length].toUpperCase();
        const keyCode = keyChar.charCodeAt(0) - 65;
        const decryptedCode = (charCode - keyCode + 26) % 26;
        const decryptedChar = String.fromCharCode(decryptedCode + 65);

        result += isUpperCase ? decryptedChar : decryptedChar.toLowerCase();
        keyIndex++;
      } else {
        result += char;
      }
    }

    return result;
  };

  // Rail Fence Encryption
  const railFenceEncrypt = (text: string, rails: number) => {
    if (!text) return "";
    if (rails < 2) return text;

    const fence: string[][] = new Array(rails).fill(null).map(() => []);
    let rail = 0;
    let direction = 1;

    for (let i = 0; i < text.length; i++) {
      fence[rail].push(text[i]);

      rail += direction;

      if (rail === 0 || rail === rails - 1) {
        direction *= -1;
      }
    }

    return fence.flat().join("");
  };

  // Rail Fence Decryption
  const railFenceDecrypt = (text: string, rails: number) => {
    if (!text) return "";
    if (rails < 2) return text;

    const fence = new Array(rails)
      .fill(null)
      .map(() => new Array(text.length).fill(null));
    let rail = 0;
    let direction = 1;

    // Mark positions in the fence
    for (let i = 0; i < text.length; i++) {
      fence[rail][i] = true;

      rail += direction;

      if (rail === 0 || rail === rails - 1) {
        direction *= -1;
      }
    }

    // Fill the fence with characters
    let index = 0;
    for (let i = 0; i < rails; i++) {
      for (let j = 0; j < text.length; j++) {
        if (fence[i][j] === true) {
          fence[i][j] = text[index++];
        }
      }
    }

    // Read off the fence
    let result = "";
    rail = 0;
    direction = 1;

    for (let i = 0; i < text.length; i++) {
      result += fence[rail][i];

      rail += direction;

      if (rail === 0 || rail === rails - 1) {
        direction *= -1;
      }
    }

    return result;
  };

  // Process the input through selected algorithms
  const processInput = () => {
    if (!input.trim()) {
      setError("Please enter some text to process");
      clearNotifications();
      return;
    }

    const enabledAlgorithms = algorithms
      .filter((algo) => algo.enabled)
      .sort((a, b) => a.order - b.order);

    if (enabledAlgorithms.length === 0) {
      setError("Please select at least one encryption algorithm");
      clearNotifications();
      return;
    }

    try {
      const results = [];
      let currentText = input;

      for (const algo of enabledAlgorithms) {
        let processedText;

        switch (algo.id) {
          case "aes":
            processedText =
              mode === "encrypt"
                ? aesEncrypt(currentText, algo.key ?? "")
                : aesDecrypt(currentText, algo.key ?? "");
            break;
          case "vigenere":
            processedText =
              mode === "encrypt"
                ? vigenereEncrypt(currentText, algo.key ?? "")
                : vigenereDecrypt(currentText, algo.key ?? "");
            break;
          case "railfence":
            processedText =
              mode === "encrypt"
                ? railFenceEncrypt(currentText, parseInt(String(algo.rails)))
                : railFenceDecrypt(currentText, parseInt(String(algo.rails)));
            break;
          default:
            processedText = currentText;
        }

        results.push({
          algorithm: algo.name,
          input: currentText,
          output: processedText,
        });

        currentText = processedText;
      }

      setIntermediateResults(results);
      setOutput(currentText);
      setSuccess(
        `${mode === "encrypt" ? "Encryption" : "Decryption"} successful!`
      );
      clearNotifications();
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "An unknown error occurred"
      );
      clearNotifications();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-gray-100">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Header with cyber-themed background */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,128,255,0.1)_0%,rgba(0,0,0,0)_80%)]"></div>
          <div className="grid grid-cols-12 gap-2 absolute inset-0 opacity-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-1 bg-blue-400 rounded"></div>
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            <Shield className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              CRYPTOFORGE
            </h1>
          </div>
          <p className="text-center text-blue-300 mt-1 text-sm font-medium tracking-wider">
            MULTI-LAYER ENCRYPTION SYSTEM
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center -mt-5 mb-6">
          <div className="inline-flex rounded-md shadow-lg z-10">
            <button
              onClick={() => setMode("encrypt")}
              className={`px-5 py-3 font-medium tracking-wide rounded-l-md transition-all duration-200 ${
                mode === "encrypt"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-700/50"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } border border-gray-600`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              ENCRYPT
            </button>
            <button
              onClick={() => setMode("decrypt")}
              className={`px-5 py-3 font-medium tracking-wide rounded-r-md transition-all duration-200 ${
                mode === "decrypt"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-700/50"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } border border-gray-600 border-l-0`}
            >
              <Unlock className="w-4 h-4 inline mr-2" />
              DECRYPT
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div
            className="bg-red-900/30 border border-red-700 text-red-300 p-4 mb-4 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="flex">
              <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div
            className="bg-green-900/30 border border-green-700 text-green-300 p-4 mb-4 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="flex items-center">
              <div className="mr-3 bg-green-500 rounded-full p-1">
                <Check className="w-4 h-4 text-black" />
              </div>
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Input/Output Section */}
          <div className="space-y-4">
            <div className="flex items-center mb-1">
              <Cpu className="w-5 h-5 mr-2 text-blue-400" />
              <h2 className="text-lg font-bold text-blue-300">
                Input/Output Terminal
              </h2>
            </div>

            <div className="mb-2 relative">
              <label className="inline-block text-sm font-bold text-blue-400 mb-2 tracking-wide">
                {mode === "encrypt" ? "PLAINTEXT" : "CIPHERTEXT"} INPUT
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-inner text-gray-200 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder={`Enter text to ${mode}...`}
                style={{ caretColor: "#60a5fa" }}
              ></textarea>
              <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-mono">
                {input.length} chars
              </div>
            </div>

            <div className="mb-2 relative">
              <label className="inline-block text-sm font-bold text-blue-400 mb-2 tracking-wide">
                {mode === "encrypt" ? "CIPHERTEXT" : "PLAINTEXT"} OUTPUT
              </label>
              <textarea
                value={output}
                readOnly
                className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-inner text-green-400 font-mono"
              ></textarea>
              <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-mono">
                {output.length} chars
              </div>
            </div>

            <button
              onClick={processInput}
              className="w-full py-3 px-4 border-0 rounded-lg shadow-lg text-sm font-bold tracking-wide text-white 
                      bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 
                      transition-all duration-200 transform hover:translate-y-px focus:outline-none 
                      focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 flex items-center opacity-0 group-hover:opacity-10">
                <div className="h-full w-2 bg-white transform -skew-x-12"></div>
              </div>
              <div className="flex items-center justify-center">
                <RotateCw className="w-4 h-4 mr-2" />
                {mode === "encrypt" ? "ENCRYPT DATA" : "DECRYPT DATA"}
              </div>
            </button>

            <div className="mt-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showIntermediateResults}
                  onChange={() =>
                    setShowIntermediateResults(!showIntermediateResults)
                  }
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:border-blue-400 focus:ring focus:ring-blue-500 focus:ring-opacity-20"
                />
                <span className="ml-2 text-sm text-gray-300">
                  Show intermediate results
                </span>
              </label>
            </div>

            {showIntermediateResults && intermediateResults.length > 0 && (
              <div className="mt-4 border border-gray-700 rounded-lg p-4 bg-gray-900/50 backdrop-blur-sm shadow-lg">
                <h3 className="font-bold text-blue-400 mb-3 text-sm tracking-wide">
                  PROCESSING CHAIN
                </h3>
                {intermediateResults.map((result, i) => (
                  <div
                    key={i}
                    className="mb-3 pb-3 border-b border-gray-700 last:border-b-0 last:mb-0 last:pb-0"
                  >
                    <div className="flex items-center mb-1">
                      <div className="w-5 h-5 rounded-full bg-blue-900 border border-blue-500 flex items-center justify-center text-xs text-blue-300 mr-2">
                        {i + 1}
                      </div>
                      <p className="text-sm font-bold text-blue-300">
                        {result.algorithm}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      Input:{" "}
                      <span className="text-gray-300">{result.input}</span>
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      Output:{" "}
                      <span className="text-green-400">{result.output}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Algorithm Configuration */}
          <div>
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              <h2 className="text-lg font-bold text-blue-300">
                Encryption Layers
              </h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Configure your encryption pipeline by selecting algorithms:
            </p>

            <div className="space-y-3">
              {algorithms
                .sort((a, b) => a.order - b.order)
                .map((algo) => (
                  <div
                    key={algo.id}
                    className="border border-gray-700 rounded-lg bg-gray-900/70 shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-gray-600"
                  >
                    <div className="p-3 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={algo.enabled}
                          onChange={() => toggleAlgorithm(algo.id)}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-400 bg-gray-800 border-gray-600 rounded"
                        />
                        <label className="ml-2 text-gray-200 font-bold">
                          {algo.name}
                          <span className="ml-2 text-xs py-0.5 px-1.5 bg-blue-900/60 text-blue-300 rounded font-mono">
                            LAYER {algo.order}
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => moveAlgorithm(algo.id, "up")}
                          disabled={algo.order === 1}
                          className="p-1 text-gray-400 hover:text-blue-400 disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveAlgorithm(algo.id, "down")}
                          disabled={algo.order === algorithms.length}
                          className="p-1 text-gray-400 hover:text-blue-400 disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleExpanded(algo.id)}
                          className="p-1 text-gray-400 hover:text-blue-400 ml-1 transition-colors"
                        >
                          {algo.expanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {algo.expanded && (
                      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                        {algo.id === "aes" && (
                          <div>
                            <label className="block text-xs font-bold text-blue-400 mb-2 tracking-wide">
                              SECRET KEY
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={algo.key}
                                onChange={(e) =>
                                  updateAlgorithmParam(
                                    algo.id,
                                    "key",
                                    e.target.value
                                  )
                                }
                                className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 
                                      text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 
                                      focus:border-blue-500 sm:text-sm font-mono"
                                placeholder="Enter your secret key"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-500" />
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              AES-256 encryption with CBC mode
                            </p>
                          </div>
                        )}

                        {algo.id === "vigenere" && (
                          <div>
                            <label className="block text-xs font-bold text-blue-400 mb-2 tracking-wide">
                              CIPHER KEY
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={algo.key}
                                onChange={(e) =>
                                  updateAlgorithmParam(
                                    algo.id,
                                    "key",
                                    e.target.value.replace(/[^A-Za-z]/g, "")
                                  )
                                }
                                className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 
                                      text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 
                                      focus:border-blue-500 sm:text-sm font-mono uppercase"
                                placeholder="Enter your cipher key (letters only)"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Classical cipher using letter substitution
                            </p>
                          </div>
                        )}

                        {algo.id === "railfence" && (
                          <div>
                            <label className="block text-xs font-bold text-blue-400 mb-2 tracking-wide">
                              NUMBER OF RAILS
                            </label>
                            <input
                              type="number"
                              min="2"
                              max="20"
                              value={algo.rails}
                              onChange={(e) =>
                                updateAlgorithmParam(
                                  algo.id,
                                  "rails",
                                  e.target.value
                                )
                              }
                              className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 
                                    text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 
                                    focus:border-blue-500 sm:text-sm font-mono"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Transposition cipher using zigzag pattern
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className="mt-5 flex space-x-3">
              <button
                onClick={() => {
                  setAlgorithms(
                    algorithms.map((algo) => ({ ...algo, enabled: true }))
                  );
                }}
                className="flex-1 py-2 px-3 border border-blue-700 rounded-md shadow-md text-sm font-bold 
                         text-blue-400 bg-blue-900/20 hover:bg-blue-900/40 transition-colors duration-200"
              >
                SELECT ALL
              </button>
              <button
                onClick={() => {
                  setAlgorithms(
                    algorithms.map((algo) => ({ ...algo, enabled: false }))
                  );
                }}
                className="flex-1 py-2 px-3 border border-gray-700 rounded-md shadow-md text-sm font-bold 
                         text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
              >
                CLEAR ALL
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-3 px-6 border-t border-gray-700 text-center text-xs text-gray-500">
          CRYPTOFORGE v1.0 • MULTI-LAYER ENCRYPTION SYSTEM •{" "}
          {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
