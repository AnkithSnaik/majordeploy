"use client";

import CopyButton from "./CopyButton";

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  // Trim trailing spaces from each line
  const trimmedCode = code
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  // Split lines for displaying line numbers
  const lines = trimmedCode.split("\n");

  return (
    <div className="my-4 bg-[#0a0a0f] rounded-lg overflow-hidden border border-[#ffffff0a]">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#ffffff08]">
        <div className="flex items-center gap-2">
          <img
            src={`/${language}.png`}
            alt={language}
            className="w-4 h-4 object-contain"
          />
          <span className="text-sm text-gray-400">{language || "plaintext"}</span>
        </div>
        <CopyButton code={trimmedCode} />
      </div>

      {/* Code block */}
      <pre className="relative p-4 overflow-x-auto text-white font-mono text-sm bg-[#0a0a0f]">
        {lines.map((line, index) => (
          <div key={index} className="flex">
            <span className="text-gray-500 w-8 text-right select-none pr-2">
              {index + 1}
            </span>
            <span>{line || "\u00A0"}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default CodeBlock;
