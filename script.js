const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const keypad = document.querySelector(".keypad");

let expression = "";
let justCalculated = false;

function updateDisplay() {
  expressionDisplay.textContent = expression || "Ready to calculate";
  resultDisplay.textContent = expression || "0";
}

function appendValue(value) {
  if (justCalculated && /[0-9.]/.test(value)) {
    expression = "";
  }
  justCalculated = false;

  const operators = ["+", "−", "×", "÷", "%"];
  const last = expression.slice(-1);

  if (operators.includes(value)) {
    if (!expression && value !== "−") return;
    if (operators.includes(last)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
  } else if (value === ".") {
    const currentNumber = expression.split(/[+−×÷%]/).pop();
    if (currentNumber.includes(".")) return;
    expression += currentNumber === "" ? "0." : ".";
  } else {
    expression += value;
  }

  updateDisplay();
}

function calculate() {
  if (!expression) return;

  try {
    let safeExpression = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-");

    // Only allow numbers, arithmetic operators, decimal points and spaces.
    if (!/^[0-9+\-*/%. ]+$/.test(safeExpression)) {
      throw new Error("Invalid expression");
    }

    // Avoid evaluating an expression that ends with an operator.
    if (/[+\-*/%.]$/.test(safeExpression)) {
      throw new Error("Incomplete expression");
    }

    const value = Function('"use strict"; return (' + safeExpression + ')')();

    if (!Number.isFinite(value)) {
      resultDisplay.textContent = "Cannot divide by 0";
      expressionDisplay.textContent = expression + " =";
      expression = "";
      justCalculated = true;
      return;
    }

    const formatted = Number.parseFloat(value.toPrecision(12)).toString();
    expressionDisplay.textContent = expression + " =";
    resultDisplay.textContent = formatted;
    expression = formatted;
    justCalculated = true;
  } catch {
    resultDisplay.textContent = "Invalid input";
    expressionDisplay.textContent = expression;
    justCalculated = true;
  }
}

function clearAll() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  if (justCalculated) {
    clearAll();
    return;
  }
  expression = expression.slice(0, -1);
  updateDisplay();
}

function changeSign() {
  if (!expression) {
    expression = "−";
  } else if (expression.startsWith("−")) {
    expression = expression.slice(1);
  } else {
    expression = "−" + expression;
  }
  justCalculated = false;
  updateDisplay();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { action, value } = button.dataset;

  if (value !== undefined) appendValue(value);
  if (action === "clear") clearAll();
  if (action === "delete") deleteLast();
  if (action === "equals") calculate();
  if (action === "sign") changeSign();
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    appendValue(key);
  } else if (key === "+") {
    appendValue("+");
  } else if (key === "-") {
    appendValue("−");
  } else if (key === "*") {
    appendValue("×");
  } else if (key === "/") {
    event.preventDefault();
    appendValue("÷");
  } else if (key === "%") {
    appendValue("%");
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape" || key === "Delete") {
    clearAll();
  }
});

updateDisplay();
