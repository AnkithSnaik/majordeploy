"use client";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language: string;
}

const ChevronUp = () => (
  <span className="inline-block w-3 h-3 border-t-2 border-l-2 border-blue-400 rotate-45" />
);

const ChevronDown = () => (
  <span className="inline-block w-3 h-3 border-b-2 border-r-2 border-blue-400 rotate-45" />
);

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = code.split("\n");
  const displayCode = isExpanded ? code : lines.slice(0, 6).join("\n");

  return (
    <div className="relative my-4">
      <pre className="p-4 bg-[#0a0a0f] text-white font-mono text-sm rounded-lg overflow-x-auto">
        <code>
          {displayCode.split("\n").map((line, idx) => (
            <div key={idx} className="flex">
              <span className="text-gray-500 w-8 text-right select-none pr-2">
                {idx + 1}
              </span>
              <span>{line || "\u00A0"}</span>
            </div>
          ))}
        </code>
      </pre>

      {lines.length > 6 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-2 right-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center gap-1 hover:bg-blue-500/30 transition-colors"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp />
            </>
          ) : (
            <>
              Show More <ChevronDown />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CodeBlock;
