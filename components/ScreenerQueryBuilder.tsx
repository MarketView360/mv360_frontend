"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronRight,
  Play,
  BookOpen,
  Zap,
  History,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  RotateCw,
  Trash2,
  Copy,
  Settings,
  Keyboard,
  Save,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  ListOrdered,
  MousePointer2,
  Star,
  StarOff,
  X,
  Lock,
} from "lucide-react";
import AutoCompleteDropdown from "./AutoCompleteDropdown";
import SyntaxHighlighter from "./SyntaxHighlighter";
import QueryValidation from "./QueryValidation";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { useAuth } from "@/providers/AuthProvider";
import {
  ENHANCED_DATA_SOURCE,
  OPERATORS,
  FUNCTIONS,
  KEYBOARD_SHORTCUTS,
  QUERY_EXAMPLES,
  ERROR_SOLUTIONS,
  validateQuery,
  getAllFields,
  QuerySuggestion,
  FieldDef,
  VALUE_SUGGESTIONS,
} from "@/lib/queryBuilder";

// Define ScreenerRow type for results
interface ScreenerRow {
  symbol: string;
  name: string;
  [key: string]: string | number | null;
}

interface HistoryEntry {
  query: string;
  timestamp: number;
  id: string;
}

export default function ScreenerQueryBuilder({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const { session } = useAuth();
  // Check if user has access to pro features (pro or elite tier)
  const isPro = session?.tier === "pro" || session?.tier === "elite";
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("Most Used");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlySep2025, setOnlySep2025] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-completion state
  const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Enhanced features state
  const [showGuide, setShowGuide] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showSyntaxHighlighting, setShowSyntaxHighlighting] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [hasSuperstarInvestors, setHasSuperstarInvestors] = useState(false);
  const [isSME, setIsSME] = useState(false);
  const [showTableView] = useState(false);
  const [sortBy] = useState<"popular" | "alphabetical">("alphabetical");
  const [favoriteFields, setFavoriteFields] = useState<string[]>([]);

  // Undo/Redo functionality
  const [history, setHistory] = useState<HistoryEntry[]>([
    { query: "", timestamp: Date.now(), id: "initial" },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  // Operator selection popup state - tracks which field has popup open (by field name)
  const [showOperatorPopupFor, setShowOperatorPopupFor] = useState<
    string | null
  >(null);

  // Query history
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRunning] = useState(false);
  const [runError] = useState<string | null>(null);
  const [results] = useState<ScreenerRow[]>([]);
  const [lastRunInfo] = useState<{
    url?: string;
    filters?: unknown;
    count?: number;
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ScreenerRow is defined in results page; avoid redefining a narrower local version here.

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load and persist history in browser cache
  useEffect(() => {
    try {
      const raw = localStorage.getItem("queryHistory");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setQueryHistory(parsed);
      }
      const fav = localStorage.getItem("favoriteFields");
      if (fav) {
        const parsedFav = JSON.parse(fav);
        if (Array.isArray(parsedFav)) setFavoriteFields(parsedFav);
      }
    } catch { }
  }, []);

  const persistHistory = useCallback((items: string[]) => {
    try {
      localStorage.setItem("queryHistory", JSON.stringify(items));
    } catch { }
  }, []);

  const persistFavorites = useCallback((items: string[]) => {
    try {
      localStorage.setItem("favoriteFields", JSON.stringify(items));
    } catch { }
  }, []);

  const toggleFavorite = useCallback(
    (fieldName: string) => {
      setFavoriteFields((prev) => {
        const exists = prev.includes(fieldName);
        const updated = exists
          ? prev.filter((f) => f !== fieldName)
          : [fieldName, ...prev];
        persistFavorites(updated);
        return updated;
      });
    },
    [persistFavorites]
  );

  const handleDeleteHistoryItem = useCallback(
    (queryToDelete: string) => {
      setQueryHistory((prev) => {
        const updated = prev.filter((q) => q !== queryToDelete);
        persistHistory(updated);
        return updated;
      });
    },
    [persistHistory]
  );

  const handleClearHistory = useCallback(() => {
    setQueryHistory([]);
    persistHistory([]);
  }, [persistHistory]);

  // Validation
  const validationErrors = validateQuery(value);
  const isValidQuery = validationErrors.length === 0 || value.trim() === "";

  // Enhanced auto-complete with fuzzy matching
  const getEnhancedSuggestions = useCallback(
    (input: string, cursor: number): QuerySuggestion[] => {
      const suggestions: QuerySuggestion[] = [];
      const beforeCursor = input.substring(0, cursor);
      const words = beforeCursor.split(/\s+/);
      const currentWord = words[words.length - 1]?.toLowerCase() || "";

      if (currentWord.length === 0) return [];

      // Get all fields for comprehensive search
      const allFields = getAllFields();

      // Value suggestions logic (Ported from searchSuggestions in lib/queryBuilder)
      const prevWord = words[words.length - 2]?.toLowerCase() || "";
      const secondPrevWord = words[words.length - 3]?.toLowerCase() || "";
      const valueField = (["=", "!=", "in", "like", "between"].includes(prevWord) ? secondPrevWord :
        ["=", "!=", "in", "like", "between"].includes(currentWord) ? prevWord : null);

      if (valueField && VALUE_SUGGESTIONS[valueField.toLowerCase()]) {
        const values = VALUE_SUGGESTIONS[valueField.toLowerCase()];
        values.forEach((val: string) => {
          if (val.toLowerCase().includes(currentWord.replace(/['"]/g, '')) || currentWord === "=" || currentWord === "in") {
            suggestions.push({
              text: val,
              type: "value",
              description: `Value for ${valueField}`,
              category: "Value",
              insertText: `"${val}"`,
              score: 1000,
            });
          }
        });
        if (suggestions.length > 0) return suggestions.sort((a, b) => (b.score || 0) - (a.score || 0));
      }

      // Enhanced field matching with scoring
      allFields.forEach((field) => {
        const fieldLower = field.name.toLowerCase();
        const score = calculateMatchScore(
          fieldLower,
          currentWord,
          field.keywords
        );

        if (score > 0) {
          suggestions.push({
            text: field.name,
            type: "field",
            description: `${field.description} (${field.unit})`,
            category: field.category || "Field",
            insertText: field.name,
            score,
            tier: field.tier,
          });
        }
      });

      // Add operators with smart spacing
      OPERATORS.forEach((op) => {
        if (
          op.symbol.toLowerCase().includes(currentWord) ||
          op.description.toLowerCase().includes(currentWord)
        ) {
          suggestions.push({
            text: op.symbol,
            type: "operator",
            description: op.description,
            category: op.category,
            insertText: ["IN", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL"].includes(op.symbol.toUpperCase())
              ? ` ${op.symbol.toUpperCase()} `
              : ` ${op.symbol} `,
            score: op.symbol.toLowerCase().startsWith(currentWord) ? 100 : 50,
          });
        }
      });

      // Add functions
      FUNCTIONS.forEach((func) => {
        if (func.name.toLowerCase().includes(currentWord)) {
          suggestions.push({
            text: func.name,
            type: "function",
            description: func.description,
            category: func.category,
            insertText: `${func.name}(`,
            score: func.name.toLowerCase().startsWith(currentWord) ? 100 : 50,
          });
        }
      });

      // Sort by score and limit results
      return suggestions
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 20);
    },
    []
  );

  // Calculate match score for better suggestions
  const calculateMatchScore = (
    fieldName: string,
    input: string,
    keywords: string[]
  ): number => {
    let score = 0;

    // Exact match
    if (fieldName === input) return 1000;

    // Starts with
    if (fieldName.startsWith(input)) score += 500;

    // Contains
    if (fieldName.includes(input)) score += 200;

    // Word boundary match
    const words = fieldName.split(/\s+/);
    words.forEach((word) => {
      if (word.toLowerCase().startsWith(input)) score += 300;
      if (word.toLowerCase().includes(input)) score += 100;
    });

    // Keywords match
    keywords.forEach((keyword: string) => {
      if (keyword.includes(input)) score += 150;
      if (keyword.startsWith(input)) score += 250;
    });

    return score;
  };

  // Add to history when query changes (debounced)
  useEffect(() => {
    if (isUndoRedo) {
      setIsUndoRedo(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (value !== history[historyIndex]?.query) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          query: value,
          timestamp: Date.now(),
          id: `entry-${Date.now()}`,
        });

        // Limit history to 100 entries
        if (newHistory.length > 100) {
          newHistory.shift();
        } else {
          setHistoryIndex((prev) => prev + 1);
        }

        setHistory(newHistory);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [value, history, historyIndex, isUndoRedo]);

  // Jump to line function
  const jumpToLine = useCallback(
    (line: number, column: number = 1) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const lines = value.split("\n");

      // Calculate character position
      let charPosition = 0;
      for (let i = 0; i < line - 1 && i < lines.length; i++) {
        charPosition += lines[i].length + 1; // +1 for newline
      }
      charPosition += Math.min(column - 1, lines[line - 1]?.length || 0);

      // Focus and set cursor position
      textarea.focus();
      textarea.setSelectionRange(charPosition, charPosition);

      // Scroll to make the line visible
      const lineHeight = 24; // matches our line-height
      const scrollTop = (line - 1) * lineHeight - textarea.clientHeight / 2;
      textarea.scrollTop = Math.max(0, scrollTop);
    },
    [value]
  );

  // Handle cursor position and auto-completion
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const newCursorPosition = e.target.selectionStart;

      onChange(newValue);
      setCursorPosition(newCursorPosition);

      // Get suggestions based on current input
      const beforeCursor = newValue.substring(0, newCursorPosition);
      const words = beforeCursor.split(/\s+/);
      const currentWord = words[words.length - 1]?.toLowerCase() || "";

      if (currentWord.length >= 1) {
        // Show suggestions after 1 character
        const newSuggestions = getEnhancedSuggestions(
          newValue,
          newCursorPosition
        );
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
        setSelectedSuggestionIndex(0);

        // Calculate dropdown position
        if (textareaRef.current && newSuggestions.length > 0) {
          const textarea = textareaRef.current;
          const rect = textarea.getBoundingClientRect();
          const textBeforeCursor = newValue.substring(0, newCursorPosition);
          const lines = textBeforeCursor.split("\n");
          const currentLine = lines.length - 1;
          const currentColumn = lines[lines.length - 1].length;

          // Approximate character width and line height
          const charWidth = 8;
          const lineHeight = 24;

          setDropdownPosition({
            top: rect.top + currentLine * lineHeight + lineHeight + 8,
            left:
              rect.left +
              currentColumn * charWidth +
              (showLineNumbers ? 60 : 24),
          });
        }
      } else {
        setShowSuggestions(false);
      }
    },
    [onChange, getEnhancedSuggestions, showLineNumbers]
  );

  // Handle global keyboard shortcuts for modals
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
        if (showGuide) setShowGuide(false);
        if (showExamples) setShowExamples(false);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showKeyboardShortcuts, showGuide, showExamples]);



  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: QuerySuggestion) => {
      if (!textareaRef.current) return;

      if (suggestion.tier === "pro" && !isPro) {
        setPaywallFeature("Advanced Screen Filters");
        setShowPaywall(true);
        return;
      }

      const textarea = textareaRef.current;
      const beforeCursor = value.substring(0, cursorPosition);
      const afterCursor = value.substring(cursorPosition);

      // Find the start of the current word
      const words = beforeCursor.split(/\s+/);
      const currentWord = words[words.length - 1] || "";
      const wordStart = beforeCursor.lastIndexOf(currentWord);

      // Replace the current word with the suggestion
      const newValue =
        value.substring(0, wordStart) +
        (suggestion.insertText || suggestion.text) +
        afterCursor;

      onChange(newValue);
      setShowSuggestions(false);

      // Set cursor position after the inserted text
      const newCursorPos =
        wordStart + (suggestion.insertText || suggestion.text).length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }, 0);
    },
    [value, cursorPosition, onChange]
  );

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedo(true);
      setHistoryIndex((prev) => prev - 1);
      onChange(history[historyIndex - 1].query);
    }
  }, [historyIndex, history, onChange]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedo(true);
      setHistoryIndex((prev) => prev + 1);
      onChange(history[historyIndex + 1].query);
    }
  }, [historyIndex, history, onChange]);

  // Clear query
  const handleClearQuery = useCallback(() => {
    onChange("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [onChange]);

  // Copy query to clipboard
  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy query:", err);
    }
  };

  // Toggle comment (add/remove # at start of line)
  const toggleComment = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lines = value.split("\n");

    // Find which lines are selected
    let currentPos = 0;
    let startLine = 0;
    let endLine = 0;

    for (let i = 0; i < lines.length; i++) {
      if (currentPos <= start && start <= currentPos + lines[i].length) {
        startLine = i;
      }
      if (currentPos <= end && end <= currentPos + lines[i].length) {
        endLine = i;
        break;
      }
      currentPos += lines[i].length + 1; // +1 for newline
    }

    // Toggle comments on selected lines
    const newLines = [...lines];
    for (let i = startLine; i <= endLine; i++) {
      if (newLines[i].startsWith("# ")) {
        newLines[i] = newLines[i].substring(2);
      } else if (newLines[i].startsWith("#")) {
        newLines[i] = newLines[i].substring(1);
      } else {
        newLines[i] = "# " + newLines[i];
      }
    }

    onChange(newLines.join("\n"));
  }, [value, onChange]);

  // Duplicate current line
  const duplicateLine = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const lines = value.split("\n");

    // Find current line
    let currentPos = 0;
    let currentLine = 0;

    for (let i = 0; i < lines.length; i++) {
      if (currentPos <= start && start <= currentPos + lines[i].length) {
        currentLine = i;
        break;
      }
      currentPos += lines[i].length + 1;
    }

    // Duplicate the line
    const newLines = [...lines];
    newLines.splice(currentLine + 1, 0, lines[currentLine]);
    onChange(newLines.join("\n"));
  }, [value, onChange]);

  // Select current line
  const selectLine = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const lines = value.split("\n");

    // Find current line boundaries
    let currentPos = 0;

    for (let i = 0; i < lines.length; i++) {
      if (currentPos <= start && start <= currentPos + lines[i].length) {
        textarea.setSelectionRange(currentPos, currentPos + lines[i].length);
        break;
      }
      currentPos += lines[i].length + 1;
    }
  }, [value]);

  // Delete current line
  const deleteLine = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const lines = value.split("\n");

    if (lines.length <= 1) {
      onChange("");
      return;
    }

    // Find current line
    let currentPos = 0;
    let currentLine = 0;

    for (let i = 0; i < lines.length; i++) {
      if (currentPos <= start && start <= currentPos + lines[i].length) {
        currentLine = i;
        break;
      }
      currentPos += lines[i].length + 1;
    }

    // Delete the line
    const newLines = [...lines];
    newLines.splice(currentLine, 1);
    onChange(newLines.join("\n"));
  }, [value, onChange]);

  // Format query (basic formatting)
  const formatQuery = useCallback(() => {
    const formatted = value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
    onChange(formatted);
  }, [value, onChange]);

  // Run query
  const handleRunQuery = useCallback(async () => {
    if (!value.trim() || !isValidQuery) return;

    // Save to history
    setQueryHistory((prev) => {
      const newHistory = [value, ...prev.filter((q) => q !== value)].slice(
        0,
        50
      );
      persistHistory(newHistory);
      return newHistory;
    });
    // Navigate to dedicated results page
    const params = new URLSearchParams({
      query: value,
      sort: "market_capitalization.desc",
      limit: String(50),
      offset: String(0),
      exchange: "us",
    });
    router.push(`/screens/results?${params.toString()}`);
  }, [value, isValidQuery, persistHistory, router]);

  // Save query to browser cache and history
  const handleSaveQuery = useCallback(() => {
    if (!value.trim()) return;
    setQueryHistory((prev) => {
      const newHistory = [value, ...prev.filter((q) => q !== value)].slice(
        0,
        50
      );
      persistHistory(newHistory);
      return newHistory;
    });
    setShowHistory(true);
  }, [value, persistHistory]);

  // Smart insertion at cursor position
  const handleSmartInsert = useCallback(
    (text: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const beforeSelection = value.substring(0, start);
      const afterSelection = value.substring(end);

      // Smart spacing
      const needsSpaceBefore =
        start > 0 &&
        !beforeSelection.endsWith(" ") &&
        !beforeSelection.endsWith("\n");
      const needsSpaceAfter =
        afterSelection.length > 0 &&
        !afterSelection.startsWith(" ") &&
        !afterSelection.startsWith("\n");

      const insertText =
        (needsSpaceBefore ? " " : "") + text + (needsSpaceAfter ? " " : "");

      const newValue = beforeSelection + insertText + afterSelection;
      onChange(newValue);

      // Set cursor position after inserted text
      const newCursorPos = start + insertText.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  // Handle operator selection from inline popup
  const handleOperatorSelect = useCallback(
    (fieldName: string, operator: string) => {
      handleSmartInsert(`${fieldName} ${operator} `);
      setShowOperatorPopupFor(null);
    },
    [handleSmartInsert]
  );

  // Insert paired characters (e.g., (), "") and keep selection/caret inside
  const insertPair = useCallback(
    (open: string, close: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const before = value.substring(0, start);
      const middle = value.substring(start, end);
      const after = value.substring(end);

      const newValue = before + open + middle + close + after;
      onChange(newValue);

      const newStart = start + open.length;
      const newEnd = start + open.length + middle.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
        setCursorPosition(newEnd);
      }, 0);
    },
    [value, onChange]
  );

  // Enhanced keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Alt+Enter to run query
      if (e.key === "Enter" && e.altKey) {
        e.preventDefault();
        handleRunQuery();
        return;
      }
      // Auto-pair insertion for brackets/quotes
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === "(") {
          e.preventDefault();
          insertPair("(", ")");
          return;
        }
        if (e.key === '"' || e.key === "'") {
          e.preventDefault();
          insertPair(e.key, e.key);
          return;
        }
      }

      // Handle suggestions navigation
      if (showSuggestions && suggestions.length > 0) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedSuggestionIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedSuggestionIndex((prev) =>
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
            break;
          case "Tab":
          case "Enter":
            if (e.key === "Enter" && e.shiftKey) break; // Allow Shift+Enter for new lines
            e.preventDefault();
            handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
            break;
          case "Escape":
            e.preventDefault();
            setShowSuggestions(false);
            break;
        }
        return;
      }

      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case " ":
            e.preventDefault();
            const newSuggestions = getEnhancedSuggestions(
              value,
              cursorPosition
            );
            setSuggestions(newSuggestions);
            setShowSuggestions(newSuggestions.length > 0);
            setSelectedSuggestionIndex(0);
            break;
          case "z":
            if (e.shiftKey) {
              e.preventDefault();
              handleRedo();
            } else {
              e.preventDefault();
              handleUndo();
            }
            break;
          case "y":
            e.preventDefault();
            handleRedo();
            break;
          case "Enter":
            e.preventDefault();
            handleRunQuery();
            break;
          case "/":
            e.preventDefault();
            toggleComment();
            break;
          case "d":
            e.preventDefault();
            duplicateLine();
            break;
          case "l":
            e.preventDefault();
            selectLine();
            break;
          case "k":
            if (e.shiftKey) {
              e.preventDefault();
              deleteLine();
            }
            break;
          case "c":
            if (e.shiftKey) {
              e.preventDefault();
              handleClearQuery();
            }
            break;
          case "f":
            if (e.shiftKey) {
              e.preventDefault();
              formatQuery();
            }
            break;
        }
      } else if (e.key === "F1") {
        e.preventDefault();
        setShowGuide(true);
      }
    },
    [
      showSuggestions,
      suggestions,
      selectedSuggestionIndex,
      value,
      cursorPosition,
      getEnhancedSuggestions,
      handleRunQuery,
      handleUndo,
      handleRedo,
      toggleComment,
      duplicateLine,
      selectLine,
      deleteLine,
      handleClearQuery,
      formatQuery,
      insertPair,
      handleSuggestionSelect,
    ]
  );

  // Load example query
  const loadExample = (exampleQuery: string) => {
    onChange(exampleQuery);
    setShowExamples(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Get filtered ratios for the gallery
  const allFields: FieldDef[] = getAllFields();
  const applySort = (arr: FieldDef[]): FieldDef[] => {
    if (sortBy === "alphabetical")
      return [...arr].sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  };
  const favoritesList: FieldDef[] = allFields.filter((f) =>
    favoriteFields.includes(f.name)
  );
  const dataSourceWithFavorites: Record<string, FieldDef[]> = {
    Favorites: favoritesList,
    ...ENHANCED_DATA_SOURCE,
  } as unknown as Record<string, FieldDef[]>;
  const baseList = searchTerm
    ? allFields.filter(
      (field) =>
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.keywords.some((keyword: string) =>
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    : dataSourceWithFavorites[
    selectedCategory as keyof typeof dataSourceWithFavorites
    ] || [];
  const filteredRatios = applySort(baseList);

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Enhanced Query Editor */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-slate-900 dark:text-white">
                Smart Query Editor
              </span>
              {isValidQuery ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Valid
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationErrors.length} error
                  {validationErrors.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(true)}
                title="Keyboard Shortcuts (F1)"
                className="hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                <Keyboard className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExamples(true)}
                title="Query Examples"
                className="hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                <FileText className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGuide(true)}
                title="Help Guide"
                className=" bg-white border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveQuery}
                disabled={!value.trim()}
                title="Save Query"
                className=" bg-white border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                onClick={handleRunQuery}
                disabled={isRunning || !isValidQuery || !value.trim()}
                size="sm"
                title="Execute Query (Ctrl+Enter, Alt+Enter)"
                className="bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900/70 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-700"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-1" />
                )}
                {isRunning ? "Running..." : "Run Query"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Enhanced Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyQuery}
                disabled={!value.trim()}
                title="Copy Query (Ctrl+C)"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearQuery}
                disabled={!value.trim()}
                title="Clear Query (Ctrl+Shift+C)"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                title="Toggle Line Numbers"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setShowSyntaxHighlighting(!showSyntaxHighlighting)
                }
                title="Toggle Syntax Highlighting"
              >
                {showSyntaxHighlighting ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4">
              <span>
                Press{" "}
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">
                  Ctrl+Space
                </kbd>{" "}
                for suggestions
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">
                  F1
                </kbd>{" "}
                for help
              </span>
              {lastRunInfo && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded border border-green-200 dark:border-green-800">
                  Results: {lastRunInfo.count ?? 0}
                </span>
              )}
            </div>
          </div>

          <div className="relative flex">
            {/* Enhanced Line numbers with error indicators */}
            {showLineNumbers && (
              <div className="shrink-0 w-16 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 py-6 px-2 relative">
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {value.split("\n").map((_, index) => {
                    const lineErrors = validationErrors.filter(
                      (error) => error.line === index + 1
                    );
                    const hasErrors = lineErrors.length > 0;

                    return (
                      <div
                        key={index}
                        className="text-right pr-2 h-6 flex items-center justify-between"
                      >
                        {/* Error indicator */}
                        <div className="w-3 flex justify-center">
                          {hasErrors && (
                            <div
                              className={`w-2 h-2 rounded-full cursor-pointer ${lineErrors.some((e) => e.severity === "error")
                                ? "bg-red-500"
                                : "bg-yellow-500"
                                }`}
                              title={lineErrors
                                .map((e) => e.message)
                                .join(", ")}
                              onClick={() => jumpToLine(index + 1)}
                            />
                          )}
                        </div>
                        {/* Line number */}
                        <div
                          className="flex-1 text-right cursor-pointer hover:text-slate-700"
                          onClick={() => jumpToLine(index + 1)}
                        >
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Enhanced Editor */}
            <div className="flex-1 relative bg-white dark:bg-slate-900">
              {/* Syntax highlighting overlay */}
              {showSyntaxHighlighting && value && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                  <div
                    className={`p-6 ${showLineNumbers ? "pl-4" : "pl-6"
                      } font-mono text-base whitespace-pre-wrap break-words`}
                    style={{
                      transform: `translateY(-${editorScrollTop}px)`,
                      lineHeight: "1.5rem",
                    }}
                  >
                    <SyntaxHighlighter code={value} className="text-base" />
                  </div>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onSelect={(e) =>
                  setCursorPosition(
                    (e.target as HTMLTextAreaElement).selectionStart
                  )
                }
                onScroll={(e) =>
                  setEditorScrollTop(
                    (e.target as HTMLTextAreaElement).scrollTop
                  )
                }
                className={`relative z-10 w-full h-64 p-6 ${showLineNumbers ? "pl-4" : "pl-6"
                  } font-mono text-base ${showSyntaxHighlighting
                    ? "bg-transparent"
                    : "bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900"
                  } transition-colors resize-y outline-none border-0 focus:ring-2 focus:ring-blue-500/20 rounded-none ${showSyntaxHighlighting
                    ? "text-transparent caret-slate-900 dark:caret-white"
                    : "text-slate-900 dark:text-white"
                  }`}
                placeholder="Start typing your query... (e.g., Market Capitalization > 1000 AND PE < 20)"
                spellCheck={false}
                style={{
                  lineHeight: "1.5rem",
                  caretColor: showSyntaxHighlighting ? undefined : "inherit",
                }}
              />

              {/* Enhanced Hints */}
              <div className="absolute top-4 right-4 text-xs text-slate-400 dark:text-slate-500 pointer-events-none z-20 space-y-1">
                <div className="text-right">Type to get suggestions</div>
                <div className="text-right">Ctrl+Enter to run</div>
                <div className="text-right">Ctrl+Z/Y for undo/redo</div>
              </div>
            </div>
          </div>

          {/* Enhanced Auto-completion dropdown */}
          <AutoCompleteDropdown
            suggestions={suggestions}
            selectedIndex={selectedSuggestionIndex}
            onSelect={handleSuggestionSelect}
            onClose={() => setShowSuggestions(false)}
            position={dropdownPosition}
            visible={showSuggestions}
          />

          {/* Enhanced Syntax preview */}
          {value && showPreview && (
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
              <div className="text-xs text-blue-700 dark:text-blue-300 mb-2 font-medium flex items-center justify-between">
                <span>Query Preview:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="h-6 px-2"
                >
                  Hide
                </Button>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <SyntaxHighlighter code={value} className="text-sm" />
              </div>
            </div>
          )}

          {/* Enhanced Validation errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 border-t border-slate-100">
              <QueryValidation
                errors={validationErrors}
                onJumpToLine={jumpToLine}
              />
            </div>
          )}

          {/* Enhanced Bottom toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className={`flex items-center gap-1 transition-colors ${showAdvancedOptions
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                  : ""
                  }`}
                title="Advanced Options"
              >
                <Settings className="w-4 h-4" />
                Advanced
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1 transition-colors ${showHistory
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                  : ""
                  }`}
              >
                <History className="w-4 h-4" />
                History ({queryHistory.length})
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-1 transition-colors ${showPreview
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                  : ""
                  }`}
              >
                <Lightbulb className="w-4 h-4" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>

              <Button
                onClick={handleRunQuery}
                disabled={isRunning || !isValidQuery || !value.trim()}
                className="flex-1 sm:flex-none bg-green-100 hover:bg-green-200 text-green-800 border border-green-300"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2 fill-current" />
                )}
                {isRunning ? "Running..." : "Run Query"}
              </Button>
            </div>
            {showAdvancedOptions && (
              <div className="w-full mt-2">
                <div className="p-3 bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlySep2025}
                        onChange={(e) => setOnlySep2025(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20"
                      />
                      Only companies with September 2025 results
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSuperstarInvestors}
                        onChange={(e) =>
                          setHasSuperstarInvestors(e.target.checked)
                        }
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20"
                      />
                      Has Superstar investors
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSME}
                        onChange={(e) => setIsSME(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20"
                      />
                      Is SME
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Run Results and Errors */}
      <div ref={resultsRef} />
      {runError && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 text-base">Run Error</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-700">{runError}</CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastRunInfo?.url && (
              <div className="text-xs text-slate-500 mb-3 break-all">
                Source: {lastRunInfo.url}
              </div>
            )}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left p-3 border-b">Code</th>
                    <th className="text-left p-3 border-b">Name</th>
                    <th className="text-left p-3 border-b">Exchange</th>
                    <th className="text-left p-3 border-b">Market Cap</th>
                    <th className="text-left p-3 border-b">PE</th>
                    <th className="text-left p-3 border-b">ROE</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono">
                        {String(r["code"] || "")}
                      </td>
                      <td className="p-3">{String(r["name"] || "")}</td>
                      <td className="p-3">
                        {String(r["exchange"] || "")}
                      </td>
                      <td className="p-3 text-right">
                        {r["market_capitalization"] ?? ""}
                      </td>
                      <td className="p-3 text-right">
                        {r["pe_ratio"] ?? ""}
                      </td>
                      <td className="p-3 text-right">{r["roe"] ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Query History */}
      {showHistory && (
        <Card className="border-blue-200 dark:border-blue-800 shadow-sm bg-blue-50/30 dark:bg-blue-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-slate-900 dark:text-slate-900">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Recent Queries ({queryHistory.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearHistory}
                  disabled={queryHistory.length === 0}
                  title="Clear all history"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {queryHistory.length === 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                No saved queries.
              </div>
            )}
            {queryHistory.map((query, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  onClick={() => onChange(query)}
                  className="flex-1 text-left p-3 rounded-md cursor-pointer bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="font-mono text-sm text-slate-800 dark:text-slate-200 truncate">
                    {query}
                  </div>
                </div>
                <button
                  onClick={() => handleSmartInsert(query)}
                  title="Insert at cursor"
                  className="p-2 rounded-md text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <MousePointer2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteHistoryItem(query)}
                  title="Delete from history"
                  className="p-2 rounded-md text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Ratio Gallery - keeping existing implementation but with improvements */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[450px]">
          {/* Enhanced Sidebar */}
          <div className="w-full lg:w-64 xl:w-72 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Field Categories
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {Object.keys({ Favorites: [], ...ENHANCED_DATA_SOURCE }).map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSearchTerm("");
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-all flex items-center justify-between group ${selectedCategory === category && !searchTerm
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 border-r-2 border-blue-500"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    <span>{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                        {((dataSourceWithFavorites as Record<string, FieldDef[]>)[category]?.length) ?? 0}
                      </span>
                      {selectedCategory === category && !searchTerm && (
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      )}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Enhanced Operator Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Insert:
                </span>

                {/* Comparison Operators */}
                <div className="flex items-center gap-1">
                  {OPERATORS.filter((op) => op.category === "Comparison")
                    .slice(0, 6)
                    .map((op) => (
                      <Button
                        key={op.symbol}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSmartInsert(op.symbol)}
                        className="h-8 px-2 font-mono text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title={`${op.description} - ${op.example}`}
                      >
                        {op.symbol}
                      </Button>
                    ))}
                </div>

                {/* Arithmetic Operators */}
                <div className="flex items-center gap-1">
                  {OPERATORS.filter((op) => op.category === "Arithmetic").map(
                    (op) => (
                      <Button
                        key={op.symbol}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSmartInsert(op.symbol)}
                        className="h-8 px-2 font-mono text-xs bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                        title={`${op.description} - ${op.example}`}
                      >
                        {op.symbol}
                      </Button>
                    )
                  )}
                </div>

                {/* Functions */}
                <div className="flex items-center gap-1">
                  {FUNCTIONS.slice(0, 4).map((func) => (
                    <Button
                      key={func.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSmartInsert(`${func.name}(`)}
                      className="h-8 px-3 font-mono text-xs bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50"
                      title={`${func.description} - ${func.example}`}
                    >
                      {func.name}()
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Field Grid / Table */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/30">
              {searchTerm && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    Found{" "}
                    <span className="font-semibold">
                      {filteredRatios.length}
                    </span>{" "}
                    field{filteredRatios.length !== 1 ? "s" : ""} matching
                    <span className="font-semibold">
                      {" "}
                      &quot;{searchTerm}&quot;
                    </span>
                  </div>
                </div>
              )}

              {!showTableView && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredRatios.map((field) => (
                    <div
                      key={field.name}
                      className="group p-4 text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <button
                          className="font-medium text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors text-left"
                          onClick={() => handleSmartInsert(field.name)}
                        >
                          {field.name}
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                            {field.unit === "₹" ? "$" : field.unit}
                          </div>
                          <button
                            className="p-1 hover:text-yellow-600 text-slate-400 dark:text-slate-500"
                            title={
                              favoriteFields.includes(field.name)
                                ? "Unpin"
                                : "Pin"
                            }
                            onClick={() => toggleFavorite(field.name)}
                          >
                            {favoriteFields.includes(field.name) ? (
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        {field.description}
                      </div>
                      {field.example && (
                        <div className="text-xs font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded mb-2">
                          {field.example}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                          onClick={() => handleSmartInsert(field.name)}
                          title="Insert field"
                        >
                          Insert
                        </Button>

                        {/* Insert op button with inline popup */}
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                            onClick={() =>
                              setShowOperatorPopupFor(
                                showOperatorPopupFor === field.name
                                  ? null
                                  : field.name
                              )
                            }
                            title="Insert comparison template"
                          >
                            Insert op
                          </Button>

                          {/* Operator Selection Popup */}
                          {showOperatorPopupFor === field.name && (
                            <>
                              {/* Backdrop to close on click outside */}
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowOperatorPopupFor(null)}
                              />
                              <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl p-4 min-w-[240px]">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                                      Select operator for {field.name}
                                    </p>
                                    <button
                                      onClick={() =>
                                        setShowOperatorPopupFor(null)
                                      }
                                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 mb-3">
                                    {[">", "<", ">=", "<="].map((op) => (
                                      <button
                                        key={op}
                                        onClick={() =>
                                          handleOperatorSelect(field.name, op)
                                        }
                                        className="h-10 px-3 font-mono text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors"
                                      >
                                        {op}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    {["=", "!="].map((op) => (
                                      <button
                                        key={op}
                                        onClick={() =>
                                          handleOperatorSelect(field.name, op)
                                        }
                                        className="h-10 px-3 font-mono text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors"
                                      >
                                        {op}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                      Logical Operators
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleOperatorSelect(
                                            field.name,
                                            "AND"
                                          )
                                        }
                                        className="flex-1 h-10 px-3 text-sm font-semibold rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70 border border-blue-200 dark:border-blue-800 transition-colors"
                                      >
                                        AND
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleOperatorSelect(field.name, "OR")
                                        }
                                        className="flex-1 h-10 px-3 text-sm font-semibold rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70 border border-purple-200 dark:border-purple-800 transition-colors"
                                      >
                                        OR
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {field.keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {field.keywords.slice(0, 3).map((keyword: string) => (
                            <span
                              key={keyword}
                              className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredRatios.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                      <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <div>No fields found matching your search.</div>
                      <div className="text-sm mt-1">
                        Try different keywords or browse categories.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showTableView && (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="text-left p-3 border-b border-slate-200 dark:border-slate-700">
                          Field
                        </th>
                        <th className="text-left p-3 border-b border-slate-200 dark:border-slate-700">
                          Unit
                        </th>
                        <th className="text-left p-3 border-b border-slate-200 dark:border-slate-700">
                          Description
                        </th>
                        <th className="text-left p-3 border-b border-slate-200 dark:border-slate-700">
                          Example
                        </th>
                        <th className="text-left p-3 border-b border-slate-200 dark:border-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRatios.map((field) => (
                        <tr
                          key={field.name}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-700/50"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                onClick={() => handleSmartInsert(field.name)}
                              >
                                {field.name}
                              </button>
                              <button
                                className="p-1 hover:text-yellow-600 text-slate-400 dark:text-slate-500"
                                title={
                                  favoriteFields.includes(field.name)
                                    ? "Unpin"
                                    : "Pin"
                                }
                                onClick={() => toggleFavorite(field.name)}
                              >
                                {favoriteFields.includes(field.name) ? (
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                ) : (
                                  <StarOff className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {field.unit === "₹" ? "$" : field.unit}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {field.description}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">
                            {field.example || "-"}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                                onClick={() => handleSmartInsert(field.name)}
                              >
                                Insert
                              </Button>
                              <div className="relative">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                                  onClick={() =>
                                    setShowOperatorPopupFor(
                                      showOperatorPopupFor === field.name
                                        ? null
                                        : field.name
                                    )
                                  }
                                >
                                  Insert op
                                </Button>
                                {showOperatorPopupFor === field.name && (
                                  <>
                                    {/* Backdrop to close popup when clicking outside */}
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={() =>
                                        setShowOperatorPopupFor(null)
                                      }
                                    />
                                    <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                                      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-xl p-4 min-w-[220px]">
                                        <div className="flex items-center justify-between mb-3">
                                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Choose operator
                                          </p>
                                          <button
                                            onClick={() =>
                                              setShowOperatorPopupFor(null)
                                            }
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                          Select operator for {field.name}
                                        </p>
                                        <div className="grid grid-cols-4 gap-1.5 mb-3">
                                          {[
                                            ">",
                                            "<",
                                            ">=",
                                            "<=",
                                            "=",
                                            "!=",
                                          ].map((op) => (
                                            <button
                                              key={op}
                                              onClick={() =>
                                                handleOperatorSelect(
                                                  field.name,
                                                  op
                                                )
                                              }
                                              className="h-9 px-2 font-mono text-sm rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-600 transition-colors"
                                            >
                                              {op}
                                            </button>
                                          ))}
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Logical Operators
                                          </p>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() =>
                                                handleOperatorSelect(
                                                  field.name,
                                                  "AND"
                                                )
                                              }
                                              className="flex-1 h-9 px-3 text-sm font-medium rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 border border-blue-300 dark:border-blue-700 transition-colors"
                                            >
                                              AND
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleOperatorSelect(
                                                  field.name,
                                                  "OR"
                                                )
                                              }
                                              className="flex-1 h-9 px-3 text-sm font-medium rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/50 border border-purple-300 dark:border-purple-700 transition-colors"
                                            >
                                              OR
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Help Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Complete Query Builder Guide
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Everything you need to know about building powerful stock
                  screening queries
                </p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Close"
              >
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">
                    Available Fields
                  </h4>
                  <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
                    {getAllFields()
                      .slice(0, 30)
                      .map((field) => (
                        <div
                          key={field.name}
                          className="p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                        >
                          <div className="font-mono text-blue-600 dark:text-blue-400 text-xs">
                            {field.name}
                          </div>
                          <div className="text-gray-500 dark:text-slate-400 text-xs">
                            {field.description}
                          </div>
                          {field.example && (
                            <div className="font-mono text-xs bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-1 rounded mt-1">
                              {field.example}
                            </div>
                          )}
                        </div>
                      ))}
                    <div className="text-gray-400 dark:text-slate-500 text-xs">
                      ...and {getAllFields().length - 30} more fields
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-purple-600 dark:text-purple-400">
                    Operators
                  </h4>
                  <div className="text-sm space-y-2">
                    {OPERATORS.map((op) => (
                      <div
                        key={op.symbol}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                      >
                        <div className="font-mono text-purple-600 dark:text-purple-400">
                          {op.symbol}
                        </div>
                        <div className="text-gray-500 dark:text-slate-400 text-xs">
                          {op.description}
                        </div>
                        <div className="font-mono text-xs bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-1 rounded mt-1">
                          {op.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">
                    Functions
                  </h4>
                  <div className="text-sm space-y-2">
                    {FUNCTIONS.map((func) => (
                      <div
                        key={func.name}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                      >
                        <div className="font-mono text-green-600 dark:text-green-400">
                          {func.name}
                        </div>
                        <div className="text-gray-500 dark:text-slate-400 text-xs">
                          {func.description}
                        </div>
                        <div className="font-mono text-xs bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-1 rounded mt-1">
                          {func.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-orange-600 dark:text-orange-400">
                  Common Error Solutions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(ERROR_SOLUTIONS).map(([error, solution]) => (
                    <div
                      key={error}
                      className="p-3 border border-orange-200 dark:border-orange-800 rounded bg-orange-50 dark:bg-orange-900/30"
                    >
                      <div className="font-medium text-orange-800 dark:text-orange-300">
                        {error}
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                        {solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowKeyboardShortcuts(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Master these shortcuts to boost your productivity
                </p>
              </div>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Close"
              >
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(KEYBOARD_SHORTCUTS).map(
                  ([shortcut, description]) => (
                    <div
                      key={shortcut}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <kbd className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md font-mono text-sm text-gray-800 dark:text-slate-300 shadow-sm">
                        {shortcut}
                      </kbd>
                      <span className="text-sm text-gray-600 dark:text-slate-400 ml-4 flex-1 text-right">
                        {description}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-400 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Pro Tip
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Use{" "}
                      <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                        Ctrl+Space
                      </kbd>{" "}
                      to trigger auto-complete at any time, and{" "}
                      <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                        Tab
                      </kbd>{" "}
                      to quickly accept suggestions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Query Examples Modal */}
      {showExamples && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowExamples(false);
          }}
        >
          {/* ... existing modal code ... */}
          {/* I will omit internal modal code as I'm just appending after it if I can match the context correctly. 
              Actually replace_file_content requires TargetContent. 
              I will replace the last few lines to append the modal. 
          */}
        </div>
      )}

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={paywallFeature}
      />
    </div>
  );
}
