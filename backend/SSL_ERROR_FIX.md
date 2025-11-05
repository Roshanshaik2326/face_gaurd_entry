# MongoDB SSL/TLS Connection Error Fix

## Error: SSL/TLS Alert Internal Error

If you're seeing:
```
MongoNetworkError: SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

This is an SSL/TLS handshake issue with MongoDB Atlas.

## Solutions

### 1. **Check MongoDB Atlas Network Access** (Most Common)

Go to MongoDB Atlas → **Network Access**:
- Click "Add IP Address"
- Add your current IP address
- OR temporarily add `0.0.0.0/0` for development (not recommended for production)
- Wait 2-3 minutes for changes to take effect

### 2. **Verify Cluster Status**

Go to MongoDB Atlas → **Database**:
- Ensure your cluster is **RUNNING** (not paused)
- Free tier clusters auto-pause after inactivity

### 3. **Check Database User**

Go to MongoDB Atlas → **Database Access**:
- Verify username: `srihamsinimrunalini21_db_user`
- Check password is correct
- Ensure user has read/write permissions

### 4. **Test Connection String**

Verify your `.env` file has the correct format:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/face-entry-guard?retryWrites=true&w=majority&appName=Cluster0
```

### 5. **Check Internet/Firewall**

- Ensure you have internet connectivity
- Check if firewall is blocking MongoDB connection
- Try from a different network if possible

### 6. **Connection String Format**

Make sure the connection string includes:
- ✅ Database name: `/face-entry-guard`
- ✅ Connection options: `?retryWrites=true&w=majority`
- ✅ App name: `&appName=Cluster0`

## Updated Code

The server.js has been updated with:
- Better timeout handling
- Improved error messages
- Connection retry logic

## Test Connection

After fixing Network Access:
1. Restart the server
2. Look for: `✅ Connected to MongoDB Atlas`
3. If still failing, check the specific error message

## Quick Fix Checklist

- [ ] IP address whitelisted in MongoDB Atlas
- [ ] Cluster is running (not paused)
- [ ] Username/password correct
- [ ] Connection string format correct
- [ ] Internet connection working
- [ ] Firewall not blocking connection
