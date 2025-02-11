function waitForElement(selector, callback) {
  const observer = new MutationObserver((mutations, observerInstance) => {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      callback();
    } else {
      if (isDeepSeek()) {
        observerInstance.observe(document.body, { childList: true, subtree: true });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

var textField = "textarea";

if (isCopilot()) {
  textField = "#userInput";
} else if (isGemini()) {
  textField = "rich-textarea";
} else if (isDeepSeek()) {
  textField = "#chat-input";
} else if (isNotebookLM()) {
  textField = ".query-box-input";
} else if (isChatGpt()){
  textField = ".ProseMirror";
}

const initialPrompts = [
  {
    name: "Sample Prompt",
    prompt: "This is a sample saved prompt\n\n click edit to change me",
  },
];

function loadPrompts() {
  const prompts = JSON.parse(localStorage.getItem("prompts"));
  if (!prompts) {
    localStorage.setItem("prompts", JSON.stringify(initialPrompts));
    return initialPrompts;
  }
  return prompts;
}

const prompts = loadPrompts();

waitForElement(textField, () => {
  if (document.querySelector("#prompt-saver")) {
    return;
  }

  var levels = 2;

    if(isNotebookLM()){
        levels = 4;
    }
    
  var parent = goUpLevels(textField, levels);

  var newPromptsContainer = document.createElement("div");
  newPromptsContainer.style.display = "flex";
  newPromptsContainer.style.gap = "10px";
  newPromptsContainer.style.paddingBottom = "10px";
  newPromptsContainer.id = "prompt-saver";

  prompts.forEach((prompt) => {
    newPromptsContainer.append(generateNewDiv(prompt.name, prompt.prompt, textField));
  });

  var editButton = document.createElement("button");
  editButton.textContent = prompts.length === 0 ? "Add" : "Edit";
  editButton.style.marginLeft = "10px";
  editButton.addEventListener("click", showEditModal);
  newPromptsContainer.append(editButton);

  parent.prepend(newPromptsContainer);
});

function generateNewDiv(name, content, textField) {
  var newDiv = document.createElement("div");
  newDiv.style.fontFamily = ".AppleSystemUIFont";
  newDiv.style.fontSize = "12px";
  newDiv.style.bottom = "10px";
  newDiv.style.right = "10px";
  newDiv.style.lineHeight = "17px";
  newDiv.style.border = "1px solid lightgray";
  newDiv.style.borderRadius = "5px";
  newDiv.style.padding = "6px";
  newDiv.style.cursor = "pointer";
  newDiv.textContent = name;
  newDiv.addEventListener("click", function () {
    var textarea = document.querySelector(textField);
      if(isChatGpt()){
        const p = document.createElement('p');
        p.textContent = content;
        if (textarea.querySelector('.placeholder')) {
          textarea.innerHTML = '';
        }
        textarea.appendChild(p);
      } else {
        textarea.value = content;
      }
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
      textarea.setSelectionRange(content.length, content.length);
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textarea);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
   
  });
  return newDiv;
}

function isNotebookLM() {
  return document.location.href.indexOf("notebooklm.google.com") > -1;
}

function isChatGpt() {
  return document.location.href.indexOf("chatgpt.com") > -1;
}

function goUpLevels(textField, levels) {
  let element = document.querySelector(textField);
  for (let i = 0; i < levels; i++) {
    if (element) {
      element = element.parentElement;
    }
  }
  return element;
}

function isGemini() {
  return document.location.href.indexOf("gemini.google.com") > -1;
}

function isCopilot() {
  return document.location.href.indexOf("copilot.microsoft") > -1;
}

function isDeepSeek() {
  return document.location.href.indexOf("chat.deepseek.com") > -1;
}

function showEditModal() {
  const modal = document.createElement("div");
  modal.style.fontFamily = ".AppleSystemUIFont";
  modal.style.fontSize = "12px";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "1000";

  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#000";
  modalContent.style.color = "#fff";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "10px";
  modalContent.style.border = "1px solid #fff";
  modalContent.style.width = "600px";
  modalContent.style.maxHeight = "80vh";
  modalContent.style.overflow = "auto";
  modalContent.style.position = "relative";

  const mobileWidth = window.innerWidth <= 768 ? "80%" : "600px";
  modalContent.style.width = mobileWidth;

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.backgroundColor = "transparent";
  closeButton.style.color = "#fff";
  closeButton.style.border = "1px solid #fff";
  closeButton.style.borderRadius = "5px";
  closeButton.style.padding = "5px 10px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    modal.remove();
    resetPromptsInMainScreen();
  });
  modalContent.appendChild(closeButton);

  const heading = document.createElement("h2");
  heading.textContent = "Edit Saved AI Prompts";
  heading.style.color = "#fff";
  heading.style.textAlign = "center";
  heading.style.marginBottom = "20px";
  heading.style.fontSize = "20px";
  modalContent.appendChild(heading);

  const promptsList = document.createElement("div");
  promptsList.id = "prompts-list";
  promptsList.style.width = "100%";
  promptsList.style.marginBottom = "10px";
  promptsList.style.display = "flex";
  promptsList.style.gap = "10px";
  promptsList.style.flexWrap = "wrap";

  const promptDetails = document.createElement("div");
  promptDetails.style.width = "100%";

  const divider = document.createElement("hr");
  divider.style.border = "1px solid #fff";
  divider.style.width = "100%";
  divider.style.margin = "10px 0";

  renderPromptsList(promptsList, promptDetails);

  modalContent.appendChild(promptsList);
  modalContent.appendChild(divider);
  modalContent.appendChild(promptDetails);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  if (prompts.length === 0) {
    const newPrompt = { name: "New Prompt", prompt: "" };
    prompts.push(newPrompt);
    renderPromptsList(promptsList, promptDetails);
    selectPrompt(newPrompt, promptDetails, true);
  } else {
    selectPrompt(prompts[0], promptDetails);
  }
}

function renderPromptsList(promptsList, promptDetails) {
  promptsList.innerHTML = "";

  promptsList.style.display = "flex";
  promptsList.style.gap = "10px";
  promptsList.style.flexWrap = "wrap";
  promptsList.style.paddingBottom = "10px";

  prompts.forEach((prompt, index) => {
    const promptElement = document.createElement("div");
    promptElement.style.fontFamily = ".AppleSystemUIFont";
    promptElement.style.fontSize = "12px";
    promptElement.style.lineHeight = "17px";
    promptElement.style.border = "1px solid lightgray";
    promptElement.style.borderRadius = "5px";
    promptElement.style.padding = "6px";
    promptElement.style.cursor = "pointer";
    promptElement.textContent = prompt.name;

    if (index === 0) {
      promptElement.style.backgroundColor = "#f0f0f0";
      promptElement.style.borderColor = "#000";
      promptElement.style.color = "#000";
    }

    promptElement.addEventListener("click", () => {
      document.querySelectorAll("#prompts-list div").forEach((el) => {
        el.style.backgroundColor = "transparent";
        el.style.borderColor = "lightgray";
        el.style.color = "#fff";
      });
      promptElement.style.backgroundColor = "#f0f0f0";
      promptElement.style.borderColor = "#000";
      promptElement.style.color = "#000";
      selectPrompt(prompt, promptDetails);
    });

    promptsList.appendChild(promptElement);
  });

  const newButton = document.createElement("button");
  newButton.textContent = "New";
  newButton.style.fontFamily = ".AppleSystemUIFont";
  newButton.style.fontSize = "12px";
  newButton.style.lineHeight = "17px";
  newButton.style.border = "1px solid lightgray";
  newButton.style.borderRadius = "5px";
  newButton.style.padding = "6px";
  newButton.style.cursor = "pointer";
  newButton.style.backgroundColor = "transparent";
  newButton.style.color = "#fff";
  newButton.style.marginLeft = "10px";
  newButton.addEventListener("click", () => {
    const newPrompt = { name: "New Prompt", prompt: "" };
    selectPrompt(newPrompt, promptDetails, true);
  });

  promptsList.appendChild(newButton);
}

function selectPrompt(prompt, promptDetails, isNewPrompt = false) {
  promptDetails.innerHTML = "";

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name:";
  nameLabel.style.color = "#fff";
  nameLabel.style.fontSize = "14px";
  const nameInput = document.createElement("input");
  nameInput.value = prompt.name;
  nameInput.style.backgroundColor = "#000";
  nameInput.style.color = "#fff";
  nameInput.style.border = "1px solid #fff";
  nameInput.style.borderRadius = "5px";
  nameInput.style.padding = "5px";
  nameInput.style.width = "100%";
  nameInput.style.fontSize = "14px";
  nameInput.addEventListener("input", (e) => {
    checkForChanges(prompt, nameInput, promptInput, saveButton, resetButton, isNewPrompt);
  });

  const promptLabel = document.createElement("label");
  promptLabel.textContent = "Prompt:";
  promptLabel.style.color = "#fff";
  promptLabel.style.display = "block";
  promptLabel.style.marginTop = "10px";
  promptLabel.style.fontSize = "14px";
  const promptInput = document.createElement("textarea");
  promptInput.value = prompt.prompt;
  promptInput.style.backgroundColor = "#000";
  promptInput.style.color = "#fff";
  promptInput.style.border = "1px solid #fff";
  promptInput.style.borderRadius = "5px";
  promptInput.style.padding = "5px";
  promptInput.style.width = "100%";
  promptInput.style.height = "100px";
  promptInput.style.fontSize = "14px";
  promptInput.addEventListener("input", (e) => {
    checkForChanges(prompt, nameInput, promptInput, saveButton, resetButton, isNewPrompt);
  });

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.style.backgroundColor = "transparent";
  saveButton.style.color = "#fff";
  saveButton.style.border = "1px solid #fff";
  saveButton.style.borderRadius = "5px";
  saveButton.style.padding = "5px 10px";
  saveButton.style.cursor = "pointer";
  saveButton.style.marginRight = "5px";
  saveButton.style.float = "right";
  saveButton.style.width = "100px";
  saveButton.style.fontSize = "14px";
  saveButton.disabled = true;
  saveButton.style.opacity = "0.5";
  saveButton.addEventListener("click", () => {
    if (promptInput.value.trim() === "") {
      alert("Prompt value cannot be empty!");
      return;
    }
    prompt.name = nameInput.value;
    prompt.prompt = promptInput.value;
    if (isNewPrompt) {
      prompts.push(prompt);
      isNewPrompt = false;
    }
    localStorage.setItem("prompts", JSON.stringify(prompts));
    alert("Prompts saved successfully!");
    renderPromptsList(promptDetails.parentElement.querySelector("#prompts-list"), promptDetails);
    resetPromptsInMainScreen();
    saveButton.disabled = true;
    saveButton.style.opacity = "0.5";
    resetButton.style.display = "none";

    const promptsList = promptDetails.parentElement.querySelector("#prompts-list");
    const newPromptElement = promptsList.children[prompts.length - 1];
    newPromptElement.style.backgroundColor = "#f0f0f0";
    newPromptElement.style.borderColor = "#000";
    newPromptElement.style.color = "#000";
  });

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  resetButton.style.backgroundColor = "transparent";
  resetButton.style.color = "#fff";
  resetButton.style.border = "1px solid #fff";
  resetButton.style.borderRadius = "5px";
  resetButton.style.padding = "5px 10px";
  resetButton.style.cursor = "pointer";
  resetButton.style.marginRight = "5px";
  resetButton.style.float = "right";
  resetButton.style.width = "100px";
  resetButton.style.fontSize = "14px";
  resetButton.style.display = isNewPrompt ? "none" : "none";
  resetButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset this prompt?")) {
      nameInput.value = prompt.name;
      promptInput.value = prompt.prompt;
      checkForChanges(prompt, nameInput, promptInput, saveButton, resetButton, isNewPrompt);
    }
  });

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.backgroundColor = "transparent";
  cancelButton.style.color = "#fff";
  cancelButton.style.border = "1px solid #fff";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.padding = "5px 10px";
  cancelButton.style.cursor = "pointer";
  cancelButton.style.float = "left";
  cancelButton.style.width = "100px";
  cancelButton.style.fontSize = "14px";
  cancelButton.style.display = isNewPrompt ? "inline-block" : "none";
  cancelButton.addEventListener("click", () => {
    if (isNewPrompt) {
      const index = prompts.indexOf(prompt);
      if (index > -1) {
        prompts.splice(index, 1);
      }
      if (prompts.length > 0) {
        selectPrompt(prompts[0], promptDetails);
      } else {
        promptDetails.innerHTML = "";
      }
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.style.backgroundColor = "transparent";
  deleteButton.style.color = "#fff";
  deleteButton.style.border = "1px solid #fff";
  deleteButton.style.borderRadius = "5px";
  deleteButton.style.padding = "5px 10px";
  deleteButton.style.cursor = "pointer";
  deleteButton.style.float = "left";
  deleteButton.style.width = "100px";
  deleteButton.style.fontSize = "14px";
  deleteButton.style.display = isNewPrompt ? "none" : "inline-block";
  deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      const index = prompts.indexOf(prompt);
      if (index > -1) {
        prompts.splice(index, 1);
        localStorage.setItem("prompts", JSON.stringify(prompts));
        renderPromptsList(promptDetails.parentElement.querySelector("#prompts-list"), promptDetails);
        resetPromptsInMainScreen();
        if (prompts.length > 0) {
          selectPrompt(prompts[0], promptDetails);
        } else {
          promptDetails.innerHTML = "";
        }
      }
    }
  });

  const moveButtons = document.createElement("div");
  moveButtons.style.display = "flex";
  moveButtons.style.gap = "5px";
  moveButtons.style.float = "left";
  moveButtons.style.marginLeft = "10px";

  if (prompts.indexOf(prompt) > 0) {
    const moveLeftButton = document.createElement("button");
    moveLeftButton.textContent = "Move Left";
    moveLeftButton.style.backgroundColor = "transparent";
    moveLeftButton.style.color = "#fff";
    moveLeftButton.style.border = "1px solid #fff";
    moveLeftButton.style.borderRadius = "5px";
    moveLeftButton.style.padding = "5px 10px";
    moveLeftButton.style.cursor = "pointer";
    moveLeftButton.style.fontSize = "12px";
    moveLeftButton.addEventListener("click", () => {
      movePromptUp(prompts.indexOf(prompt));
      renderPromptsList(promptDetails.parentElement.querySelector("#prompts-list"), promptDetails);
      selectPrompt(prompt, promptDetails);
    });
    moveButtons.appendChild(moveLeftButton);
  }

  if (prompts.indexOf(prompt) < prompts.length - 1) {
    const moveRightButton = document.createElement("button");
    moveRightButton.textContent = "Move Right";
    moveRightButton.style.backgroundColor = "transparent";
    moveRightButton.style.color = "#fff";
    moveRightButton.style.border = "1px solid #fff";
    moveRightButton.style.borderRadius = "5px";
    moveRightButton.style.padding = "5px 10px";
    moveRightButton.style.cursor = "pointer";
    moveRightButton.style.fontSize = "12px";
    moveRightButton.addEventListener("click", () => {
      movePromptDown(prompts.indexOf(prompt));
      renderPromptsList(promptDetails.parentElement.querySelector("#prompts-list"), promptDetails);
      selectPrompt(prompt, promptDetails);
    });
    moveButtons.appendChild(moveRightButton);
  }

  promptDetails.appendChild(nameLabel);
  promptDetails.appendChild(nameInput);
  promptDetails.appendChild(promptLabel);
  promptDetails.appendChild(promptInput);
  promptDetails.appendChild(deleteButton);
  promptDetails.appendChild(moveButtons);
  promptDetails.appendChild(saveButton);
  promptDetails.appendChild(resetButton);
  promptDetails.appendChild(cancelButton);

  saveButton.disabled = true;
  saveButton.style.opacity = "0.5";
}

function checkForChanges(prompt, nameInput, promptInput, saveButton, resetButton, isNewPrompt) {
  const hasChanges = nameInput.value !== prompt.name || promptInput.value !== prompt.prompt;
  saveButton.disabled = !hasChanges || promptInput.value.trim() === "";
  saveButton.style.opacity = hasChanges ? "1" : "0.5";
  resetButton.style.display = hasChanges && !isNewPrompt ? "inline-block" : "none";
}

function movePromptUp(index) {
  if (index > 0) {
    const temp = prompts[index];
    prompts[index] = prompts[index - 1];
    prompts[index - 1] = temp;
  }
}

function movePromptDown(index) {
  if (index < prompts.length - 1) {
    const temp = prompts[index];
    prompts[index] = prompts[index + 1];
    prompts[index + 1] = temp;
  }
}

function resetPromptsInMainScreen() {
  const promptsContainer = document.querySelector("#prompt-saver");
  if (promptsContainer) {
    promptsContainer.innerHTML = "";
    prompts.forEach((prompt) => {
      promptsContainer.append(generateNewDiv(prompt.name, prompt.prompt, textField));
    });
    const editButton = document.createElement("button");
    editButton.textContent = prompts.length === 0 ? "Add" : "Edit";
    editButton.style.marginLeft = "10px";
    editButton.addEventListener("click", showEditModal);
    promptsContainer.append(editButton);
  }
}
