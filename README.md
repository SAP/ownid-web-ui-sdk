# OwnID - Web SDK

## Description
OwnID enables your customers to use their phone as a key to instantly login to your websites or apps. Passwords are finally gone.

This component is a widget that you can add to your website to include OwnID in your register and login pages. For the server, OwnID offers server-sdk-net project that has integration to SAP CDC (Gigya) but it is also possible to use the server SDK to integrate with other Identity Management System. 

Evaluation is possible even without any back-end implementation. You can follow the developer-tutorial (see example code below) to set your environment. This is using OwnID back-end that already include the SAP CDC (Gigya) integration. Later on you can provide your SAP CDC (Gigya) credentials to set your production environment or you can take OwnID server SDK and implement the integration to your Identity Management System.


## Documentation

OwnID Documentation you can find on our [Documentation](https://docs.ownid.com) page

## Example with [Gigya](https://gigya.com) integration
### Registration

Add OwnID library to the end of the file just before closing body tag.

```html
  <script async defer src="https://cdn.ownid.com/js/gigya-sdk.es5.js"></script>
</body>
```

Then we need to add empty `<div>` with `id="ownid"`. OwnID widget will be placed in this wrapper. Put it after a confirm password field (This is not required position.
You can put it in the body of the page). 

```html
      <input class="own-input" type="password" placeholder="Confirm Password" id="confirm-password">

      <div id="ownid"></div>

      <button class="own-button" type="submit">Create Account</button>
```

Next step is adding widget itself. Add next code before closing head tag.

```html
  <script>
      window.ownidAsyncInit = function() {
          ownid.init({
              URLPrefix: 'https://passwordless.pilot.ownid.com/ownid/'
          });

          window.ownidWidget = ownid.render({
              type: 'register',
              element: document.querySelector('#ownid'),
              inline: {
                  targetElement: document.querySelector('#password'),
                  additionalElements: [document.querySelector('#confirm-password')],
                  offset: [-10, 0]
              }
          });
      }
  </script>
</head>
```

Then we should change submit form behaviour. 

```js
function onRegister() {
  var data;
  var firstName = document.querySelector('#first-name').value;
  var email = document.querySelector('#email').value;
  var password = document.querySelector('#password').value;
  var errors = document.querySelector('.errors');
  errors.classList.remove('show');

  ownid.getOwnIDPayload(window.ownidWidget).then(function (ownidPayload) {
      if (ownidPayload.error) {
          errors.classList.add('show');
          errors.textContent = ownidPayload.message;
          return;
      }

      if (ownidPayload.data) {
          password = window.ownid.generateOwnIDPassword(12);
          data = {
              ownIdConnections: [
                  ownidPayload.data,
              ],
          };
      }

      window.gigya.accounts.initRegistration({
          callback: function (response) {
              window.gigya.accounts.register({
                  regToken: response.regToken,
                  email: email,
                  password: password,
                  profile: {
                      firstName,
                  },
                  data: data,
                  finalizeRegistration: true,
                  callback: function (res) {
                      if (res.status === 'FAIL') {
                          errors.classList.add('show');
                          errors.textContent = res.errorDetails;

                          return;
                      }

                      window.location = '/account.html';
                  }
              });
          },
      });
  });
}
```

That's it! Registration widget will appear at password field of the form.

### Login
Almost same as registration. 

Add OwnID library to the end of the file just before closing body tag.

```html
  <script async defer src="https://cdn.ownid.com/js/gigya-sdk.es5.js"></script>
</body>
```

Then we need to add empty `<div>` with `id="ownid"`. OwnID widget will be placed in this wrapper. Put it after a password field
(This is not required position. You can put it in the body of the page). 

```html
<input class="own-input" type="password" placeholder="Password" id="password">

<div id="ownid"></div>

<div class="popup-text">
```

Next step is adding widget itself. Add next code before closing head tag.

```html
  <script>
      window.ownidAsyncInit = function() {
          ownid.init({
              URLPrefix: 'https://passwordless.pilot.ownid.com/ownid/'
          });

           window.ownidWidget = ownid.gigya.render({
                type: 'login',
                element: document.querySelector('#ownid'),
                inline: {
                    userIdElement: document.querySelector('#email'),
                    targetElement: document.querySelector('#password'),
                    offset:[-10, 0]
                },
                onLogin: function (data) {
                    if (data.sessionInfo) {
                        document.cookie = `${data.sessionInfo.cookieName}=${data.sessionInfo.cookieValue}; path=/`;
  
                        window.location = '/account.html';
                    }
                }
            });
      }
  </script>
</head>
```

Then we should change submit form behaviour. 
Replace function body with next code.

```js
function onLogin() {
    var email = document.querySelector('#email').value;
    var password = document.querySelector('#password').value;
    var errors = document.querySelector('.errors');
    errors.classList.remove('show');
    
    window.gigya.accounts.login({
        loginID: email,
        password: password,
        callback: function (res) {
            if (res.status === 'FAIL') {
                errors.classList.add('show');
                errors.textContent = res.errorDetails;
    
                return;
            }
            window.ownid.getOwnIDPayload(window.ownidWidget).then(function (statusRS) {
                if (statusRS.data) {
                    window.gigya.accounts.getAccountInfo({
                        include: 'data',
                        callback: function (userData) {
                            var ownIdConnections = userData.data.ownIdConnections || [];
    
                            ownIdConnections.push(statusRS.data);
    
                            window.gigya.accounts.setAccountInfo({
                                data: {
                                    ownIdConnections: ownIdConnections
                                },
                                callback: function () {
                                    window.location = '/account.html';
                                }
                            });
                        },
                    });
                }
            });
        }
    });
}
```

That's it! Login widget will appear at password field of the form.

