(async () => {
  const res0 = await fetch(
    "https://aggie-reuse.azurewebsites.net/api/GetCategories?code=ndxaiFhA5WDFWWCzN6oJKf1Z_O_lECDFY-TzzwMmqpUfAzFuZ5E7aw==&token=",
    {
      method: "POST",
      body: JSON.stringify({ token: localStorage.getItem("token") }),
    }
  );
  const categories = await res0.json();
  // Back to previous page
  const backBtn = document.getElementById("back-btn");
  backBtn.addEventListener("click", function () {
    window.location.href = "view.html";
  });

  // Go to transaction page
  const transactionButton = document.getElementById("transaction-btn");
  transactionButton.addEventListener("click", function () {
    window.location.href = "transactions/index.html";
  });

  function getSelectType() {
    let select = document.querySelector(".selectType");
    categories[0].items.forEach((item) => {
      let option = document.createElement("option");
      option.value = item;
      option.text = item;
      select.appendChild(option);
    });
    categories[1].items.forEach((item) => {
      let option = document.createElement("option");
      option.value = item;
      option.text = item;
      select.appendChild(option);
    });
    categories[2].items.forEach((item) => {
      let option = document.createElement("option");
      option.value = item;
      option.text = item;
      select.appendChild(option);
    });
  }

  function outputData() {}

  const today = new Date().toLocaleDateString();
  const res = await fetch(
    "https://aggie-reuse.azurewebsites.net/api/GetHistory?code=d5zod3gkXIck9bQHNJiVsEWJ359YIKK8uuyqfl0vFakfAzFuuuDvdQ==",
    {
      method: "POST",
      body: JSON.stringify({ token: localStorage.getItem("token") }),
    }
  );
  const json = await res.json();
  const res1 = await fetch(
    "https://aggie-reuse.azurewebsites.net/api/GetAllItems?code=-Fjj8lcCpsLQQFZSMehNNTAh_yOFTzo9OSfOmz__Bhj_AzFuizWnPg==&token=",
    {
      method: "POST",
      body: JSON.stringify({ token: localStorage.getItem("token") }),
    }
  );
  const json1 = await res1.json();
  const json_arr = [JSON.parse(JSON.stringify(json1))];
  for (let i = 1; i < 30; i++) json_arr.push(JSON.parse(JSON.stringify(json1)));
  for (let i = 1; i < 30; i++) {
    let date = new Date();
    date.setDate(date.getDate() - i);
    let dateString = date.toLocaleDateString();
    // loop through json and find all items with date
    for (let j = 0; j < json.length; j++) {
      if (new Date(json[j].date).toLocaleDateString() === dateString) {
        // find item in json1
        for (let k = 0; k < json1.length; k++) {
          if (json_arr[i][k].type === json[j].type) {
            if (json[j].operation === "addItem") {
              for (let l = i; l < 30; l++)
                json_arr[l][k].quantity += json[j].quantity;
            } else if (json[j].operation === "removeItem") {
              for (let l = i; l < 30; l++)
                json_arr[l][k].quantity -= json[j].quantity;
            }
          }
        }
      }
    }
  }
  function get_type(type) {
    // generate json_arr for each type
    // from json_arr
    let arr = [];
    for (let i = 0; i < json_arr.length; i++) {
      for (let j = 0; j < json_arr[i].length; j++) {
        if (json_arr[i][j].type === type) {
          arr.push({
            quantity: json_arr[i][j]["quantity"],
            date: new Date(
              new Date() - i * 24 * 60 * 60 * 1000
            ).toLocaleDateString(),
          });
        }
      }
    }
    return arr.reverse();
  }
  const select = document.querySelector(".selectType");
  select.addEventListener("change", function () {
    const type = select.value;
    const data = get_type(type);
    new Chart(document.getElementById("graph"), {
      type: "line",
      data: {
        labels: data.map((row) => row.date),
        datasets: [
          {
            label: "Inventory Over Time",
            data: data.map((row) => row.quantity),
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  });
  getSelectType();
})();
