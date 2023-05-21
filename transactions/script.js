(() => {
  const map = {
    addItem: "Add Item",
    addType: "Add Type",
    removeItem: "Remove Item",
    removeType: "Remove Type",
  };
  fetch(
    "https://aggie-reuse.azurewebsites.net/api/GetHistory?code=d5zod3gkXIck9bQHNJiVsEWJ359YIKK8uuyqfl0vFakfAzFuuuDvdQ==",
    {
      method: "POST",
      body: JSON.stringify({ token: localStorage.getItem("token") }),
    }
  ).then((res) =>
    res.json().then((json) => {
      let table = document.getElementById("table");

      let header = document.createElement("tr");
      let type = document.createElement("th");
      let quantity = document.createElement("th");
      let date = document.createElement("th");
      let operation = document.createElement("th");
      let backBtn = document.getElementById("back-btn");
      // back button
      backBtn.addEventListener("click", function () {
        window.location.href = "../analytics.html";
      });
      type.innerHTML = "Type";
      quantity.innerHTML = "Quantity";
      date.innerHTML = "Date";
      operation.innerHTML = "Operation";
      header.appendChild(type);
      header.appendChild(quantity);
      header.appendChild(date);
      header.appendChild(operation);
      table.appendChild(header);

      for (let i = 0; i < json.length; i++) {
        let row = document.createElement("tr");
        let type = document.createElement("td");
        let quantity = document.createElement("td");
        let date = document.createElement("td");
        let operation = document.createElement("td");
        type.innerHTML = json[i].type ? json[i].type : "";
        quantity.innerHTML = json[i].quantity ? json[i].quantity : "x";
        date.innerHTML = json[i].date
          ? new Date(json[i].date).toLocaleDateString()
          : "";
        operation.innerHTML = json[i].operation ? map[json[i].operation] : "";
        row.appendChild(type);
        row.appendChild(quantity);
        row.appendChild(date);
        row.appendChild(operation);
        table.appendChild(row);
      }
    })
  );
})();
