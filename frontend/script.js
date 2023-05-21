(() => {
  "use strict";
  const mainContainer = document.querySelector(".main");
  const addBtn = document.getElementById("add-btn");
  const removeBtn = document.getElementById("remove-btn");
  const analyticsBtn = document.getElementById("analytics-btn");
  const addPopupContainer = document.querySelector(".addPopup");
  const addPopupContainerRemove = document.querySelector(".removePopup");
  const catContainer = document.querySelector(".categoryContainer.add");
  const catContainerRemove = document.querySelector(
    ".categoryContainer.remove"
  );
  const closeBtn = document.querySelector("#closeBtn.add");
  const closeBtnRemove = document.querySelector("#closeBtn.remove");
  const category = document.querySelector(".category.add");
  const categoryRemove = document.querySelector(".category.remove");
  let categories = { clothes: [], accessories: [], other: [] };
  fetch(
    "https://aggie-reuse.azurewebsites.net/api/GetCategories?code=ndxaiFhA5WDFWWCzN6oJKf1Z_O_lECDFY-TzzwMmqpUfAzFuZ5E7aw=="
  )
    .then((res) => res.json())
    .then((data) => {
      data.forEach((cat) => {
        cat.items.sort();
        categories[cat.name] = cat.items;
      });
      addCategoryType(category);
      addCategoryType(categoryRemove);
    });
  let inventory = { clothes: {}, accessories: {}, other: {} };
  fetch(
    "https://aggie-reuse.azurewebsites.net/api/GetAllItems?code=-Fjj8lcCpsLQQFZSMehNNTAh_yOFTzo9OSfOmz__Bhj_AzFuizWnPg=="
  )
    .then((res) => res.json())
    .then((data) => {
      data.forEach((item) => {
        const { category, type, quantity } = item;
        inventory[category][type] = quantity;
      });
      function generate_table(category) {
        const clothes = document.querySelector("." + category);
        const clothesBody = document.createElement("tbody");
        clothes.appendChild(clothesBody);
        let clothesCount = Object.keys(inventory[category]).length;

        Object.keys(inventory[category]).forEach((type) => {
          const row = document.createElement("tr");
          const typeCell = document.createElement("td");
          const quantityCell = document.createElement("td");
          typeCell.innerText = type;
          quantityCell.innerText = inventory[category][type];
          row.appendChild(typeCell);
          row.appendChild(quantityCell);
          clothesBody.appendChild(row);
        });
        const clothesRow = document.createElement("tr");
        const clothesCat = document.createElement("td");
        clothesCat.classList.add("table-cat");
        clothesCat.rowSpan = clothesCount;
        clothesCat.innerText =
          category.charAt(0).toUpperCase() + category.slice(1);
        clothesRow.appendChild(clothesCat);
        clothesBody
          .querySelector("tr")
          .insertBefore(clothesCat, clothesBody.querySelector("td"));
      }
      generate_table("clothes");
      generate_table("accessories");
      generate_table("other");
    });

  function update_tables() {
    fetch(
      "https://aggie-reuse.azurewebsites.net/api/GetAllItems?code=-Fjj8lcCpsLQQFZSMehNNTAh_yOFTzo9OSfOmz__Bhj_AzFuizWnPg=="
    )
      .then((res) => res.json())
      .then((data) => {
        data.forEach((item) => {
          const { category, type, quantity } = item;
          inventory[category][type] = quantity;
        });
        Object.keys(inventory).forEach((category) => {
          const tableBody = document.querySelector("." + category)
            .childNodes[0];
          let index = 0;
          Object.keys(inventory[category]).forEach((type) => {
            tableBody.childNodes[index].childNodes[1].innerText =
              inventory[category][type];
            index++;
          });
        });
      });
  }
  // popupRowBtn.onclick = () => addPopupRow();
  catContainerRemove
    .querySelector(".fa-trash-can")
    .addEventListener("click", () => {
      removeCatRemove(catContainerRemove);
    });
  catContainer.querySelector(".fa-trash-can").addEventListener("click", () => {
    removeCat(catContainer);
  });
  categoryRemove.addEventListener("change", function () {
    addCategoryType(categoryRemove);
  });
  category.addEventListener("change", function () {
    addCategoryType(category);
  });
  let lastCatRemove = addPopupRow("remove");
  const listenerRemove = () => {
    lastCatRemove.removeEventListener("change", listenerRemove);
    lastCatRemove = addPopupRow("remove");
    lastCatRemove.addEventListener("change", listenerRemove);
  };
  lastCatRemove.addEventListener("change", listenerRemove);
  let lastCat = addPopupRow();
  const listener = () => {
    lastCat.removeEventListener("change", listener);
    lastCat = addPopupRow();
    lastCat.addEventListener("change", listener);
  };
  lastCat.addEventListener("change", listener);

  removeBtn.addEventListener("click", function () {
    addPopupContainerRemove.classList.remove("hidden");
    closeBtnRemove.addEventListener("click", function () {
      addPopupContainerRemove.classList.add("hidden");
    });
  });
  addBtn.addEventListener("click", function () {
    addPopupContainer.classList.remove("hidden");
    closeBtn.addEventListener("click", function () {
      addPopupContainer.classList.add("hidden");
    });
  });

  function addPopupRow(add = "add") {
    const newCatContainer = document.createElement("div");
    newCatContainer.classList.add("categoryContainer");
    newCatContainer.classList.add(add);
    const catElement = document.createElement("select");
    let option1 = document.createElement("option");
    option1.value = "";
    option1.text = "--Category--";
    catElement.appendChild(option1);
    let option2 = document.createElement("option");
    option2.value = "clothes";
    option2.text = "Clothes";
    catElement.appendChild(option2);
    let option3 = document.createElement("option");
    option3.value = "accessories";
    option3.text = "Accessories";
    catElement.appendChild(option3);
    let option4 = document.createElement("option");
    option4.value = "other";
    option4.text = "Other";
    catElement.appendChild(option4);
    newCatContainer.appendChild(catElement);
    catElement.addEventListener("change", function () {
      addCategoryType(catElement);
    });

    const type = document.createElement("select");
    type.classList = "type " + add;
    let option5 = document.createElement("option");
    option5.value = "";
    option5.text = "--Type--";
    type.appendChild(option5);
    newCatContainer.appendChild(type);

    const quantity = document.createElement("input");
    quantity.type = "number";
    quantity.classList = "quantity " + add;
    quantity.name = "quantity";
    quantity.step = "1";
    quantity.min = "0";
    quantity.value = "1";
    newCatContainer.appendChild(quantity);

    const trash = document.createElement("i");
    trash.classList = "fa-solid fa-trash-can";
    trash.addEventListener("click", () => {
      if (add == "add") removeCat(newCatContainer);
      else removeCatRemove(newCatContainer);
    });
    newCatContainer.appendChild(trash);

    if (add == "add") {
      addPopupContainer.insertBefore(
        newCatContainer,
        addPopupContainer.lastChild
      );
    } else {
      addPopupContainerRemove.insertBefore(
        newCatContainer,
        addPopupContainerRemove.lastChild
      );
    }
    addPopupContainer.scrollTop = addPopupContainer.scrollHeight;
    return catElement;
  }

  function removeCat(container) {
    if (container.querySelector("select") == lastCat) {
      lastCat = addPopupRow();
      lastCat.addEventListener("change", listener);
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.parentNode.removeChild(container);
  }

  function removeCatRemove(container) {
    if (container.querySelector("select") == lastCatRemove) {
      lastCatRemove = addPopupRow();
      lastCatRemove.addEventListener("change", listener);
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.parentNode.removeChild(container);
  }

  function addCategoryType(option) {
    let container = option.parentNode;

    // Remove any previously added select tags
    let select = container.querySelector("select.type");
    // remove any previously added options
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
    let option1 = document.createElement("option");
    option1.value = "";
    option1.text = "--Type--";
    select.appendChild(option1);

    if (option.value != "") {
      if (option.value == "clothes") {
        clothesOptions(select);
      } else if (option.value == "accessories") {
        accessoriesOptions(select);
      } else if (option.value == "other") {
        otherOptions(select);
      }
    }
  }

  async function clothesOptions(select) {
    categories["clothes"].forEach((item) => {
      let option = document.createElement("option");
      option.value = item;
      option.text = item;
      select.appendChild(option);
    });
  }

  async function accessoriesOptions(select) {
    categories["accessories"].forEach((item) => {
      let option = document.createElement("option");
      option.value = item;
      option.text = item;
      select.appendChild(option);
    });
  }

  async function otherOptions(select) {
    categories["other"].forEach((item) => {
      let option = document.createElement("option");
      option.value = item;
      option.text = item;
      select.appendChild(option);
    });
  }

  function displayPopup(message, time = 5000) {
    const result = document.getElementById("result");
    result.innerHTML = message;
    result.classList.add("show");
    setTimeout(function () {
      result.classList.remove("show");
    }, time);
  }

  document.querySelector("#removeBtn").addEventListener("click", async () => {
    const items = [];
    document.querySelectorAll(".categoryContainer.remove").forEach((cat) => {
      if (cat.querySelector("select.type").value == "") return;
      let item = {
        category: cat.querySelector("select").value,
        type: cat.querySelector("select.type").value,
        quantity: parseInt(cat.querySelector("input").value),
      };
      items.push(item);
    });
    if (items.length == 0) {
      displayPopup("No items to remove", 2000);
      return;
    }
    // combine items with same category and type
    let combinedItems = [];
    items.forEach((item) => {
      let found = false;
      combinedItems.forEach((combinedItem) => {
        if (
          combinedItem.category == item.category &&
          combinedItem.type == item.type
        ) {
          combinedItem.quantity = combinedItem.quantity + item.quantity;
          found = true;
        }
      });
      if (!found) {
        combinedItems.push(item);
      }
    });
    let res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/RemoveItems?code=XrwbrEgE4nFtb2NOhvBGieQ4yLM0jSqzwOpsYZn6CntoAzFuAF3vSg==",
      {
        method: "POST",
        body: JSON.stringify({ data: combinedItems }),
      }
    );
    let text = await res.text();
    if (text != "Not enough items") {
      text = text.replace(/(?:\r\n|\r|\n)/g, "<br>");

      displayPopup(text);
      addPopupContainerRemove
        .querySelectorAll(".categoryContainer")
        .forEach((cat) => {
          addPopupContainerRemove.removeChild(cat);
        });
      addPopupRow("remove");
      lastCatRemove = addPopupRow("remove");
      lastCatRemove.addEventListener("change", listenerRemove);
      update_tables();
    } else {
      displayPopup(text, 2000);
    }
  });

  document.querySelector("#addBtn").addEventListener("click", async () => {
    const items = [];
    document.querySelectorAll(".categoryContainer").forEach((cat) => {
      if (cat.querySelector("select.type").value == "") return;
      let item = {
        category: cat.querySelector("select").value,
        type: cat.querySelector("select.type").value,
        quantity: parseInt(cat.querySelector("input").value),
      };
      items.push(item);
    });
    if (items.length == 0) {
      displayPopup("No items to add", 2000);
      return;
    }
    // combine items with same category and type
    let combinedItems = [];
    items.forEach((item) => {
      let found = false;
      combinedItems.forEach((combinedItem) => {
        if (
          combinedItem.category == item.category &&
          combinedItem.type == item.type
        ) {
          combinedItem.quantity = combinedItem.quantity + item.quantity;
          found = true;
        }
      });
      if (!found) {
        combinedItems.push(item);
      }
    });
    let res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/AddItems?code=Ms1gGUN9IEGdsysS0KuXM9xu7v5FD27YSLO0HNjOJthwAzFudx5FIQ==&clientId=default",
      {
        method: "POST",
        body: JSON.stringify({ data: combinedItems }),
      }
    );
    let text = await res.text();
    text = text.replace(/(?:\r\n|\r|\n)/g, "<br>");

    displayPopup(text);
    addPopupContainer.querySelectorAll(".categoryContainer").forEach((cat) => {
      addPopupContainer.removeChild(cat);
    });
    addPopupRow();
    lastCat = addPopupRow();
    lastCat.addEventListener("change", listener);
    update_tables();
  });
})();
