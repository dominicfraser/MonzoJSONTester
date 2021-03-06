const express = require('express')
const path = require('path')
const request = require('request')

const router = new express.Router()

const monzoAPIRouter = require('./monzoAPIController')

router.use('/api', monzoAPIRouter)

router.get('/authorised', (req, res) => {
  console.log("sending POST request to exchange authorization code for access token")

  request.post(
      'https://api.monzo.com/oauth2/token',
      { form: {
        grant_type: "authorization_code",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code: req.query.code
        }
      },
      (error, response, body) => {
        if (response.statusCode !== 200) {
          console.log('Not 200')
          if (error) {
            console.log('Error: ', error)
          }
          return 
        } else {
          res.sendFile(path.join(__dirname + '/../client/build/index.html'))

          if(process.env.STATE === req.query.state){
            //Monzo Docs: If this value differs from what you sent, you must abort the authentication process.

            const bodyObj = JSON.parse(body)
            req.session.access_token = bodyObj.access_token
            req.session.expires_in = bodyObj.expires_in
            req.session.refresh_token = bodyObj.refresh_token
            req.session.user_id = bodyObj.user_id
          }
        } 
      }
  )
})

router.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/build/index.html'))
})

module.exports = router
