import React, { Component } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import $ from "jquery";

class ButtonAppBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  handleScroll = () => {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      document.getElementById("nav").style.background = "#054a91";
      $("#nav").css({
        paddingTop: "15px",
        color: "#E8F7EE"
      });
    } else {
      $("#nav").css({
        background: "transparent",
        "box-shadow": "none"
      });
    }
  };

  componentDidMount = () => {
    window.addEventListener("scroll", this.handleScroll);
    var doc = document.getElementById("wallet").textContent;
    var str = doc.match(/.{1,6}/g);
    var fin = str[0] + "..." + str[str.length - 1];
    document.getElementById("wallet").textContent = fin;
  };
  handleOpen = () => {
    this.setState({
      open: true
    });
  };

  handleClose = () => {
    this.setState({
      open: false
    });
  };
  render() {
    const { address, balance } = this.props;
    return (
      <div>
        <AppBar
          id="nav"
          position="fixed"
          style={{ background: "none", boxShadow: "none" }}
        >
          <Toolbar>
            <Grid container>
              <Grid item xs={6}>
                <img
                  src="LogoRocket.png"
                  alt="ok"
                  className="imgStyle1"
                  id="imgStyle1"
                />
              </Grid>
              <Grid item xs={6}>
                <Button
                  // variant="outlined"
                  style={{ color: "#E8F7EE" }}
                  className="buttonStyle1"
                  id="wallet"
                  onClick={this.handleOpen}
                >
                  {address}
                </Button>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="simple-dialog-title"
          open={this.state.open}
        >
          <div className="divStyle1" style={{ padding: "20px" }}>
            <p className="spanStyle1">Address:</p>
            <p id="navAddress">{address}</p>
            <p className="spanStyle1">Balance: </p>
            <p className="bld">{balance}</p>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default ButtonAppBar;
