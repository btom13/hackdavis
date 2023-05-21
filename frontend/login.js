(() => {
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
      .then((res) => res.json)
      .then((json) => {
        console.log(json);
      });
    event.preventDefault();

    return false;
    // if (json.) {
    //   window.location.href = '/home.html';
    // }
  });
})();
