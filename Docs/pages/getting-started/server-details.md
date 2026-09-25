# Server Details

You do not need these details for a normal chat. Use them when connecting another app or checking why the server has not started.

## Address and access

By default, Nativ listens at `http://127.0.0.1:8080`. That address reaches the server on **your Mac**, not from another device. API clients must send your Nativ API key as a Bearer token.

## Check its status

A **stop** button at the bottom of Nativ's sidebar means the server is running. For a clearer check, open **Dev → Developer** and look for the green **Live** status. **Server Output** on that page shows the latest start-up or model-loading error.

## If it is not live

- **Port 8080 is in use:** Change the port on the Developer page, then start the server again.
- **A model will not load:** Check **Models → Installed**, then read **Server Output** for the error.
- **It is still starting:** Larger models can take longer. Wait for **Live** or an error before retrying.

To stop the server, select the sidebar's **stop** button or choose **Stop Server** from Nativ's menu-bar menu. Your models and conversations remain on your Mac.
