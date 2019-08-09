var mysql = require("mysql");
var inquirer = require("inquirer");
require("dotenv").config();
var key = require("./key.js");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: key.password.id,
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log()
    run();
});

function run() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "choices",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].name + ' || ' + ' $' + res[i].price);

                        }
                        return choiceArray;
                    },
                    message: "Which item would you like to purchase?"
                },
                {
                    name: "purchase",
                    type: "input",
                    message: "How many would you like to buy?"
                },

            ]).then(function (answer) {
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].name + ' || ' + ' $' + res[i].price === answer.choices) {
                        chosenItem = res[i];
                    }
                }
                if (chosenItem.units_instock > parseInt(answer.purchase)) {
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                units_instock: chosenItem.units_instock - answer.purchase
                            },
                            {
                                item_ID: chosenItem.item_ID
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Your total is: " + "$" + answer.purchase * chosenItem.price)
                            console.log("Order is on the way!");
                            go();
                        }
                    )
                } else {
                    console.log("We do not have sufficent inventory to complete order.")
                    go();
                }
            })
    })
};

function go() {
    inquirer
        .prompt(
            {
                name: "continue",
                type: "confirm",
                message: "Would you like to make another purchase?"
            }

        ).then(
            function (answer) {
                if (answer.continue === true) {
                    run();
                } else {
                    console.log("Thank you for shopping at Bamazon!")
                    connection.end();
                }
            }
        )
}









// console.log(
//     "Item: " +
//     res[i].name +
//     " || Price: " +
//     res[i].price
// );