import got from 'got';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import qs from 'querystring';
import readline from 'readline';
import mongoose from 'mongoose';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// MongoDB connection setup
mongoose.connect('mongodb+srv://Dlabstest:kCRW5KDpVCPLoVvP@cluster0.gvjvqhg.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a MongoDB schema for the data you want to save
const userSchema = new mongoose.Schema({
  // Define your schema fields here
  name: String,
  description: String,
  followers_count: Number,
  following_count: Number,
  tweet_count: Number,
  listed_count: Number,
  // Add more fields as needed
});

const User = mongoose.model('User', userSchema);

// The code below sets the consumer key and consumer secret from your environment variables
// To set environment variables on macOS or Linux, run the export commands below from the terminal:
// export CONSUMER_KEY='YOUR-KEY'
// export CONSUMER_SECRET='YOUR-SECRET'
const consumer_key = 'XfsXqVDXyMVLUsYMvYLlwb0aJ';
const consumer_secret = 'T00QANFfUJJyNAk70v5RrvNNuAvGv4ZZsPAHofu4X6wiWPB3cl';

// These are the parameters for the API request
// specify Tweet IDs to fetch, and any additional fields that are required
// by default, only the Tweet ID and text are returned
const params = 'user.fields=created_at,description,public_metrics&expansions=pinned_tweet_id&tweet.fields=public_metrics'; // Edit optional query parameters here

const endpointURL = `https://api.twitter.com/2/users/me?${params}`;

// this example uses PIN-based OAuth to authorize the user
const requestTokenURL = 'https://api.twitter.com/oauth/request_token?oauth_callback=oob';
const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
const accessTokenURL = 'https://api.twitter.com/oauth/access_token';

const oauth = OAuth({
  consumer: {
    key: consumer_key,
    secret: consumer_secret,
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) =>
    crypto.createHmac('sha1', key).update(baseString).digest('base64'),
});

async function input(prompt) {
  return new Promise((resolve, reject) => {
    rl.question(prompt, (out) => {
      rl.close();
      resolve(out);
    });
  });
}

async function requestToken() {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: requestTokenURL,
      method: 'POST',
    })
  );

  const req = await got.post(requestTokenURL, {
    headers: {
      Authorization: authHeader['Authorization'],
    },
  });

  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function accessToken({ oauth_token, oauth_token_secret }, verifier) {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: accessTokenURL,
      method: 'POST',
    })
  );

  const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`;

  const req = await got.post(path, {
    headers: {
      Authorization: authHeader['Authorization'],
    },
  });

  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function getRequest({ oauth_token, oauth_token_secret }) {
  const token = {
    key: oauth_token,
    secret: oauth_token_secret,
  };

  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: endpointURL,
      method: 'GET',
    },
    token)
  );

  const req = await got(endpointURL, {
    headers: {
      Authorization: authHeader['Authorization'],
      'user-agent': 'v2UserLookupJS',
    },
  });

  if (req.body) {
    return JSON.parse(req.body);
  } else {
    throw new Error('Unsuccessful request');
  }
}
// ...
(async () => {
  try {
    // Get request token
    const oAuthRequestToken = await requestToken();

    // Get authorization
    authorizeURL.searchParams.append('oauth_token', oAuthRequestToken.oauth_token);
    console.log('Please go here and authorize:', authorizeURL.href);
    const pin = await input('Paste the PIN here: ');

    // Get the access token
    const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());

    // Make the request
    const response = await getRequest(oAuthAccessToken);

    // Save all the fetched data to MongoDB
    const userData = response.data;
    console.log(userData);
    
    const user = new User({
      name: userData.name,
      description: userData.description,
      created_at: userData.created_at,
      followers_count: userData.public_metrics.followers_count,
      following_count: userData.public_metrics.following_count,
      tweet_count: userData.public_metrics.tweet_count,
      listed_count: userData.public_metrics.listed_count
      // Add more fields as needed
    });

    await user.save();

    console.log('Data saved to MongoDB');
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
  process.exit();
})();
