# GraphQL Profile Page Project

A responsive web application that authenticates users and displays their school data from a GraphQL API with interactive SVG-based data visualizations.

## Features

- **User Authentication**: Secure login with username/email and password using Basic authentication
- **JWT Token Management**: Secure token storage and automatic session handling
- **GraphQL Integration**: Implements all three required query types:
  - Basic query: User information
  - Query with arguments: Specific object data
  - Nested query: Results with related user data
- **Profile Dashboard**: Three information sections displaying:
  - Basic user information (ID, login, email, etc.)
  - XP progress and transaction history
  - Audit statistics and project results
- **Data Visualizations**: Two SVG-based interactive charts:
  - XP progress over time (line chart)
  - Project success rate (pie chart)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: JWT with localStorage
- **Data Fetching**: Fetch API for GraphQL requests
- **Visualizations**: Hand-crafted SVG elements (no external libraries)
- **Styling**: Pure CSS with Flexbox/Grid layout

## Project Structure

```
├── index.html          # Login page
├── profile.html        # Main profile dashboard
├── css/
│   └── style.css      # All application styles
├── js/
│   ├── auth.js        # Authentication logic
│   ├── graphql.js     # GraphQL queries and data handling
│   ├── graphs.js      # SVG chart generation
│   └── profile.js     # Profile page functionality
└── README.md          # This file
```

## Setup Instructions

### 1. Configure API Endpoints

Before using the application, you need to update the API endpoints in the JavaScript files:

**In `js/auth.js`:**
```javascript
const API_BASE_URL = 'https://YOUR_DOMAIN/api/auth/signin';
```

**In `js/graphql.js`:**
```javascript
const GRAPHQL_API_URL = 'https://YOUR_DOMAIN/api/graphql-engine/v1/graphql';
```

Replace `YOUR_DOMAIN` with your actual GraphQL API domain.

### 2. Local Development

To run the application locally:

1. Clone or download this repository
2. Update the API endpoints as described above
3. Start a local web server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
4. Open your browser and navigate to `http://localhost:8000`

### 3. Deployment

This application can be deployed to any static hosting service:

#### GitHub Pages
1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select your branch and root folder
4. Your app will be available at `https://yourusername.github.io/repository-name`

#### Netlify
1. Drag and drop your project folder to [netlify.com/drop](https://netlify.com/drop)
2. Or connect your GitHub repository for automatic deployments

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the deployment prompts

## Usage

### Login
1. Open the application in your browser
2. Enter your username/email and password
3. Click "Login" to authenticate
4. You'll be redirected to your profile page upon successful login

### Profile Dashboard
- **Basic Information**: View your user ID, login, email, and account creation date
- **XP Progress**: See your total XP, recent transactions, and progress statistics
- **Audit Statistics**: View your project completion rates and success metrics
- **Data Visualizations**: Interactive charts showing:
  - Cumulative XP progress over time with hover tooltips
  - Project success rate with pass/fail breakdown

### Logout
Click the "Logout" button in the header to clear your session and return to the login page.

## GraphQL Queries Implemented

### 1. Basic Query
Fetches basic user information:
```graphql
query {
  user {
    id
    login
    firstName
    lastName
    email
    createdAt
  }
}
```

### 2. Query with Arguments
Fetches specific object data:
```graphql
query($objectId: Int!) {
  object(where: { id: { _eq: $objectId }}) {
    id
    name
    type
    attrs
    createdAt
  }
}
```

### 3. Nested Query
Fetches results with related user and object data:
```graphql
query {
  result {
    id
    grade
    type
    createdAt
    user {
      id
      login
    }
    object {
      id
      name
      type
    }
  }
}
```

## Data Visualizations

### XP Progress Chart (Line Chart)
- Shows cumulative XP growth over time
- Interactive tooltips display exact values
- Responsive scaling based on data range
- Clean axis labels and grid lines

### Success Rate Chart (Pie Chart)
- Displays project pass/fail ratio
- Color-coded segments (green for passed, red for failed)
- Percentage display in center
- Legend with exact counts

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Features

- JWT tokens stored securely in localStorage
- Automatic token validation on protected pages
- Base64 encoding for login credentials
- Automatic logout on authentication failures
- CORS-friendly API requests

## Audit Requirements Compliance

✅ **Authentication**
- Login page accepts username:password and email:password
- Appropriate error messages for invalid credentials
- Successful authentication with valid credentials
- Secure JWT token storage

✅ **Profile Sections**
- Exactly three information sections
- One additional statistics section with graphs
- All sections clearly labeled and organized

✅ **GraphQL Queries**
- All three required query types implemented
- Efficient queries fetching only necessary data
- Authentication error handling

✅ **SVG Graphs**
- Two different types of SVG graphs
- Graphs generated using pure SVG elements
- Accurate data representation
- Labels, legends, and appropriate scales

✅ **Hosting Ready**
- All paths are relative for hosting compatibility
- No external dependencies
- Clean, maintainable code structure

## Troubleshooting

### Common Issues

1. **"No authentication token found" error**
   - Make sure you're logged in
   - Check if the JWT token is stored in localStorage
   - Try logging out and logging in again

2. **GraphQL errors**
   - Verify API endpoints are correctly configured
   - Check network connectivity
   - Ensure your authentication token is valid

3. **Charts not displaying**
   - Check browser console for JavaScript errors
   - Ensure data is being fetched successfully
   - Verify SVG elements are being created

### Development Tips

- Use browser Developer Tools to inspect network requests
- Check the Console tab for JavaScript errors
- Use localStorage inspector to verify token storage
- Test with different screen sizes for responsive design

## License

This project is created for educational purposes as part of a GraphQL profile page implementation exercise.

## Contributing

This is a learning project. Feel free to fork and experiment with additional features like:
- More chart types (bar charts, histograms)
- Advanced filtering and sorting
- Dark mode toggle
- Export functionality for data
- Additional user statistics
