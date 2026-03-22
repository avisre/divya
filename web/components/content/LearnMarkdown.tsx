import type { ReactNode } from "react";

function renderInlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  const segments = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={`${keyPrefix}-strong-${index}`}>{segment.slice(2, -2)}</strong>;
    }

    if (segment.startsWith("*") && segment.endsWith("*")) {
      return <em key={`${keyPrefix}-em-${index}`}>{segment.slice(1, -1)}</em>;
    }

    return <span key={`${keyPrefix}-text-${index}`}>{segment}</span>;
  });
}

function renderParagraphLines(block: string, keyPrefix: string) {
  return block.split("\n").map((line, index, lines) => (
    <span key={`${keyPrefix}-line-${index}`}>
      {renderInlineMarkdown(line, `${keyPrefix}-${index}`)}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export function LearnMarkdown({ markdown }: { markdown: string }) {
  const blocks = markdown
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div data-testid="learn-entry-body" className="learn-entry__body">
      {blocks.map((block, index) => {
        const orderedLines = block.split("\n").filter(Boolean);
        const isOrderedList = orderedLines.length > 1 && orderedLines.every((line) => /^\d+\.\s+/.test(line));
        const headingMatch = block.match(/^\*\*(.+)\*\*$/);

        if (headingMatch) {
          return <h3 key={`block-${index}`}>{headingMatch[1]}</h3>;
        }

        if (isOrderedList) {
          return (
            <ol key={`block-${index}`}>
              {orderedLines.map((line, lineIndex) => (
                <li key={`block-${index}-item-${lineIndex}`}>
                  {renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""), `block-${index}-${lineIndex}`)}
                </li>
              ))}
            </ol>
          );
        }

        return <p key={`block-${index}`}>{renderParagraphLines(block, `block-${index}`)}</p>;
      })}
    </div>
  );
}
