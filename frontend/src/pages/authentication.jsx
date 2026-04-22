import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { Snackbar } from "@mui/material";

const defaultTheme = createTheme();

export default function Authentication() {
  const [bgImage, setBgImage] = React.useState("");
  //   const [username, setUsername] = React.useState("");
  // Update your username state to check localStorage on load
  const [username, setUsername] = React.useState(
    localStorage.getItem("rememberedUsername") || "",
  );
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);
  const [rememberMe, setRememberMe] = React.useState(false);

  React.useEffect(() => {
    // //using unsplash api
    // const fetchWallpaper = async () => {
    //     try {
    //         const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    //         const response = await fetch(
    //             `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=wallpapers,nature&orientation=landscape`
    //         );
    //         const data = await response.json();
    //         setBgImage(data.urls.regular);
    //     } catch (error) {
    //         console.error("Unsplash Error:", error);
    //         setBgImage("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200");
    //     }
    // };

    // using Picsum
    const fetchWallpaper = async () => {
      // This uses Picsum, which has NO rate limit and gives you a random image every time
      // using a random ID to prevent browser caching.
      const randomId = Math.floor(Math.random() * 1000);
      setBgImage(`https://picsum.photos/1200/800?random=${randomId}`);
    };
    fetchWallpaper();
  }, []);

  const handleSnackBarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);

        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
        }
      } else if (formState === 1) {
        let result = await handleRegister(name, username, password);
        console.log(result);
        setUsername("");
        setMessage(result);
        //  setMessage("Registration Successful!"); // Set the message for the Snackbar
        //  setName("");
        setOpen(true);
        setError("");
        setFormState(0); // Switch to Login tab after success
        setPassword("");
      }
    } catch (err) {
      console.log(err);
      // Use ?. to safely check if response and data exist
      let errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please check your connection.";
      setError(errorMessage);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        {/* Left Side: Image - Use size prop for Grid2 */}
        <Grid
          size={{ xs: false, sm: 4, md: 7 }}
          sx={{
            backgroundImage: `url('${bgImage}')`, // Wrapped in single quotes
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Right Side: Form - Adjusted size to 5 to make a total of 12 */}
        <Grid
          size={{ xs: 12, sm: 8, md: 5 }}
          component={Paper}
          elevation={6}
          square
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <Box sx={{ mb: 2 }}>
              <Button
                variant={formState === 0 ? "contained" : "text"}
                onClick={() => {
                  setFormState(0);
                  setError("");
                }}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "text"}
                onClick={() => {
                  setFormState(1);
                  setError("");
                }}
              >
                Sign Up
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <p style={{ color: "red" }}>{error}</p>
              {/* {error && <p style={{ color: "red" }}>{error}</p>} */}

              {/* NEW: Remember Me Checkbox */}
              {formState === 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
              )}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleSnackBarClose}
        message={message}
      />
    </ThemeProvider>
  );
}
