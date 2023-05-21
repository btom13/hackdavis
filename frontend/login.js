(() => {
  let first = true;
  document.getElementById("submit").addEventListener("click", (event) => {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let res = fetch(
      "https://aggie-reuse.azurewebsites.net/api/Login?code=Eeh7Hsdy7LkOaMZUEEV0ZSqhheujNxE1eq1rt4WlOcN0AzFuJdp0_A==",
      {
        method: "POST",
        body: JSON.stringify({ username: username, password: password }),
      }
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.token) {
          localStorage.setItem("token", json.token);
          window.location.href = "./view.html";
        }
      });
    event.preventDefault();
    return false;
  });
  const create = document.getElementById("create");
  create.addEventListener("click", (event) => {
    if (first) {
      const form = document.getElementById("login");
      const input = document.createElement("input");
      input.id = "masterPassword";
      input.type = "password";
      input.name = "masterPassword";
      input.placeholder = "Master Password";
      form.insertBefore(input, document.getElementById("buttons"));
      document.getElementById("buttons").style.display = "flex";
      document.getElementById("submit").remove();

      first = false;
      event.preventDefault();
      return false;
    } else {
      fetch(
        "https://aggie-reuse.azurewebsites.net/api/CreateAccount?code=Ms1gGUN9IEGdsysS0KuXM9xu7v5FD27YSLO0HNjOJthwAzFudx5FIQ==&clientId=default",
        {
          method: "POST",
          body: JSON.stringify({
            username: document.getElementById("username").value,
            password: document.getElementById("password").value,
            masterPassword: document.getElementById("masterPassword").value,
          }),
        }
      )
        .then((res) => res.json())
        .then((json) => {
          if (json.token) {
            localStorage.setItem("token", json.token);
            window.location.href = "./view.html";
          }
        });
      event.preventDefault();
      return false;
    }
  });
})();
