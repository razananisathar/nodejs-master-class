# Pizza Delivery Service App

## Introduction
Cheesy Delights, Inc. Pizza delivery service API is a REST based and always returns responses in JSON.

This API provides a customer to sign up with the service, add items to the shopping cart, place an order and checkout an order by paying through charge card. Payments are handled through [Stripe API](https://stripe.com/docs/api). User receives an order receipt to user's email and [Mailgun API](https://documentation.mailgun.com/en/latest/user_manual.html) used for delivering emails.

## Prerequisites

You need a Stripe account and Mailgun account.

- Create a [Stripe account](https://stripe.com) and get the `API key` and `secret`.
- Create a [Mailgun account](https://www.mailgun.com/) and get the `API key`.
- Ensure you have installed node.js `version 8.9.4` or above in your system.

## Application Setup

- Get a copy of the `pizza-delivery-app` by cloning or downloading.
- Open `lib/config.js`. Insert Stripe and Mailgun api details.
- Open terminal, navigate to application directory. Run `node index.js`.
- The server start running on `port 3000`.

## API Documentation

## Authenticate

This API uses a token to authenticate requests. The token parameter passed in request headers. User needs to authenticate with the system to add items to a cart, place orders and change user account settings.

Headers:
  ```
  Content-Type: "application/json",
  token: "44nwgbvvx2i4vo876dfi"
  ```  

### Token

Represents token details.

**Token attributes:**
- id `(String)`: unique identifier.
- email `(String)`: email id of the user.
- expires `(Number)`: token expiration time, a token    expires after one hour from current time.
- extend `(boolean)`: extend the token expiration time.

**Requests:**

- **POST [/api/tokens]**

  Create a new token. Email and password parameters are required.

  Sample request:
  ```json
  {
    "email": "Jaymie@domain.com",
    "password": "Jaymie@123"
  }
  ```

  Sample response (200):  
  ```json
  {
    "id": "44nwgbvvx2i4vo876dfi",
    "email": "Jaymie@domain.com",
    "expires": 5617630349431200000
  }
  ```

  Responses: 200, 400, 500

- **PUT  [/api/tokens]**

  Extend the token expiration time. Token should not be expired already and `extend:true`.

  Sample request:
  ```json
  {
    "id": "44nwgbvvx2i4vo876dfi",
    "extend": true
  }
  ```

  Sample response (200):  
  ```json
  {}
  ```

  Responses: 200, 400, 500

- **GET  [/api/tokens/:id]**

  Retrieve a token by it's id.

  Sample request:
  ```
  /api/tokens?id=44nwgbvvx2i4vo876dfi
  ```

  Sample response (200):  
  ```json
  {
    "id": "44nwgbvvx2i4vo876dfi",
    "email": "Jaymie@domain.com",
    "expires": 5617630349431200000
  }
  ```

  Responses: 200, 400, 500

- **DELETE [/api/tokens/:id]**

  Delete a given token.

  Sample request:
  ```
  /api/tokens?id=44nwgbvvx2i4vo876dfi
  ```

  Sample response (200):
  ```json
  {}
  ```

  Responses: 200, 400, 500

## Menu

The API allows to retrieve the list of all the available items.

**Requests:**

- **GET [/api/menu]**

  Sample request:
  ```
  /api/menu
  ```

  Sample response (200):
  ```json
  [
    {
      "id": 1001,
      "name": "7 Cheese Pizza",
      "description": "A perfect cheese blend of mozzarella, cheddar, monterey jack, parmesan, provolone & romano with a layer of cream cheese, giving you the ultimate cheese experience. You can also add a blend of green chili and onion on yours as a complimentary topping.",
      "vegetarian": true,
      "image": "7-cheese-pizza.jpg",
      "prices": [
        {
          "pan": "large",
          "price": 4.50
        },
        {
          "pan": "medium",
          "price": 3.60
        },
        {
          "pan": "small",
          "price": 3.00
        }
      ]
    },
    {
      "id": 1002,
      "name": "BBQ Chicken",
      "description": "BBQ chicken accompanied by spicy jalapenos, onions and a double layer of mozzarella cheese.",
      "vegetarian": false,
      "image":"bbq-chicken.jpg",
      "prices": [
        {
          "pan": "large",
          "price": 5.25
        },
        {
          "pan": "medium",
          "price": 4.60
        },
        {
          "pan": "small",
          "price": 3.25
        }
      ]
    }
  ]
  ```

  Responses: 200, 400

## Items

A pizza represented by an item object.

**Item attributes:**
- id `(String)`: unique identifier.
- name `(String)`: name of the pizza.
- description `(String)`: description of the pizza.
- vegetarian `(Boolean)`: type of the pizza.
- prices `(Array)`: array of price objects.
  - The price object attributes are;
    - pan `(String)` - pizza pan type (large, medium and small).
    - price `(number)` - price of a pizza pan.

**Requests:**

- **GET [/api/items/:id]**

  Retrieves an item by it's id. Item id is required.

  Sample request:
  ```
  /api/items?id=1001
  ```

  Sample response:
  ```json
  {
    "id": 1001,
    "name": "7 Cheese Pizza",
    "description": "A perfect cheese blend of mozzarella, cheddar, monterey jack, parmesan, provolone & romano with a layer of cream cheese, giving you the ultimate cheese experience. You can also add a blend of green chili and onion on yours as a complimentary topping.",
    "vegetarian": true,
    "image": "7-cheese-pizza.jpg",
    "prices": [
      {
        "pan": "large",
        "price": 4.50
      },
      {
        "pan": "medium",
        "price": 3.60
      },
      {
        "pan": "small",
        "price": 3.00
      }
    ]
  }
  ```

  Responses: 200, 400

## Users

A customer can place orders by creating a user account.The API allows to create, delete, read, and update a user object.  

**User attributes:**
- firstName `(String)`: first name of the user.
- lastName `(String)`: last name of the user.
- email `(String)`: email id of the user.
- password `(String)`: password of the user.
- address `(String)`: address of the user's location.
- city `(String)`: city of the user's location.
- state `(String)`: state/province of the user.
- postalCode `(String)`: postal code of the user.

**Requests:**

- **POST [/api/users]**

  Create a user. All the user parameters are required.

  Sample request:
  ```json
  {
    "firstName":"Jaymie J",
    "lastName": "Harley",
    "email": "Jaymie@domain.com",
    "password": "Jaymie@123",
    "address": "3851  Memory Lane",
    "city": "Hickory Hills",
    "state": "Illinois",
    "postalCode":"60457"
  }

  ```
  Sample response (200):  
  ```json
  {}
  ```

  Responses: 200, 400, 500

- **PUT  [/api/users]**

  Update a user. Email is required and other parameters are optional. Token must be passed in the headers.

  Sample request:
  ```json
  {
    "firstName":"Jaymie",
    "lastName": "Harley",
    "email": "Jaymie@domain.com",
    "password": "Jaymie@123",
    "address": "3851  Memory Lane",
    "city": "Hickory Hills",
    "state": "Illinois",
    "postalCode":"60457"
  }

  ```
  Sample response (200):  
  ```json
  {}
  ```

  Responses: 200, 400, 403, 500

- **GET  [/api/users/:email]**

  Retrieve a user by email. Email is required and token must be passed in the headers.

  Sample request:
  ```
  /api/users?email=Jaymie@domain.com
  ```

  Sample response (200):
  ```json
  {
    "firstName":"Jaymie",
    "lastName": "Harley",
    "email": "Jaymie@domain.com",
    "password": "Jaymie@123",
    "address": "3851  Memory Lane",
    "city": "Hickory Hills",
    "state": "Illinois",
    "postalCode":"60457",
    "cartId": false,
    "orders": ["t9ljniemlgrktq54udde", "rcqvngec4msk3f2mt6dp"]
  }
  ```

  Responses: 200, 400, 403, 500

- **DELETE [/api/users/:email]**

  Delete a user. Email is required and token must be passed in the headers.

  Sample request:
  ```
  /api/users?email=Jaymie@domain.com
  ```
  Sample response (200):  
  ```json
  {}
  ```

  Responses: 200, 400, 403, 500

## Carts

A user can add items to a cart. The API allows to create, delete, read, and update a cart object.  

Cart object represents a cart.

**Cart attributes:**
- items `(Array)`: Array of item objects.

  An item object attributes are;
    - name `(String)`: name of the item.
    - pan `(String)`: pan type.
    - price `(number)`: unit price of the item.
    - qty `(number)`: number of quantities.

**Requests:**

- **POST [/api/carts]**

  Create a cart. Token must be passed in the headers.

  Sample request:
  ```json
  "items":[
    {
      "name": "Chicken Bacon Mayo",
      "pan":"large",
      "price":5.40,
      "qty":1,
    }
  ]
  ```

  Sample response (200):  
  ```json
  {}
  ```

  Responses: 200, 400, 403, 500

- **PUT  [/api/cart]**

  Update a cart. Cart id is required and token must be passed in the headers.

  Sample request:
  ```json
  "id":"jrpjrgqnqj1jeg2hvn7a",
  "items":[
    {
      "name": "Chicken Bacon Mayo",
      "pan":"large",
      "price":5.40,
      "qty":1,
    },
    {
      "name": "7 Cheese Pizza",
      "pan": "medium",
      "price": 5.40,
      "qty": 1,
    }
  ]
  ```

  Sample response (200):  
  ```json
  {}
  ```

  Responses: 200, 400, 403, 500

- **GET  [/api/carts/:id]**

  Retrieve a cart by it's id. Cart id is required and token must be passed in the headers.

  Sample request:
  ```
  /api/carts?id=jrpjrgqnqj1jeg2hvn7a
  ```

  Sample response (200):
  ```json
  {
    "id":"jrpjrgqnqj1jeg2hvn7a",
    "items":[
      {
        "name": "Chicken Bacon Mayo",
        "pan":"large",
        "price":5.40,
        "qty":1,
      },
      {
        "name": "7 Cheese Pizza",
        "pan": "medium",
        "price": 5.40,
        "qty": 1,
      }
    ]
  }
  ```

  Responses: 200, 400, 403, 500

## Orders

A user can create an order. The API allows to create, and read order object.  

**Order attributes:**
- id `(String)`: unique identifier.
- cartId `(String)`: unique identifier of the cart.
- cardName `(String)`: name in the charge card.
- cardNumber `(String)`: 16 digits number in the charge card.
- cardCvc `(String)`: cvc number of the charge card.
- cardExpireMonth `(Number)`:
- cardExpireYear `(Number)`: the charge card expiration year
- payment - `(String)`: status of the Stripe payments. There are three states. `pending`, `succeeded` and `failed`.
- chargeId - Stripe charge object id.
- receipt -`(String)`: receipt status delivered through Mailgun email service. There are three states. `pending`, `sent` and `failed`.
- deliveredId - Mailgun email delivered id.

**Requests:**

- **POST [/api/orders]**

  Retrieve an order. Token must be passed in the headers.

  Sample request:
  ```json
  {
    "cartId":"jrpjrgqnqj1jeg2hvn7a",
    "cardName": "J Harley",
    "cardNumber": "4242 4242 4242 4242",
    "cardCvc": "234",
    "cardExpireMonth": 02,
    "cardExpireMonth": 2020
  }

  ```
  Sample response (200):  
  ```json
  {}
  ```

  Responses: 200, 400, 403, 500

- **GET  [/api/orders/:id]**

  Retrieve an order by it's id. Order id is required and token must be passed in the headers.

  Sample request:
  ```
  /api/orders?id=t9ljniemlgrktq54udde
  ```

  Sample response (200):
  ```json
  {
    "id":"t9ljniemlgrktq54udde",
    "email":"Jaymie@domain.com",
    "cartId":"jrpjrgqnqj1jeg2hvn7a",
    "receipt":"sent",
    "payment":"succeeded",
    "chargeId":"ch_1ElcKWKp5MkOYrPc1zDsvOS7",
    "deliveredId":"<20190615135406.1.2E8A9B2C20B28D34@sandboxb727f43502c14d89b810068903f9f4fe.mailgun.org>"
  }
  ```

  Responses: 200, 400, 403, 500

## Errors

| Error Code  | Description   |
|-------------|---------------|
| **400** ```Bad Request```| The request could not be understood. Missing required parameters or parameters are invalid. |
| **403** ```Forbidden```| Access denied. Missing required token in header or token is invalid. |
| **405** ```Method Not Allowed```| The requested method not supported. This API supports POST, PUT, GET and DELETE methods. |
| **500** | Internal server errors. |
