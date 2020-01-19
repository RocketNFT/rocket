import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function OutlinedCard({ title, address, balance, actions, erc721Status }) {
  const classes = useStyles();

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" component="p">
          Address
          <br />
          {address}
        </Typography>
        {
          balance !== undefined ?
          <Typography variant="body2" component="p">
            Balance
            <br />
            {balance}
          </Typography>
          : null
        }
        {
          erc721Status !== undefined ?
          <Typography variant="body2" component="p">
            Admin Status : {erc721Status.isAdminLocked ? 'locked' : 'unlocked'}
            <br />
            NFT owner Status : {erc721Status.isOwnerLocked ? 'locked' : 'unlocked'}
          </Typography>
          : null
        }
      </CardContent>
      <CardActions>
        {actions && actions.map(({value, disclaimer, ...props}, index) => {
          return (
            <div style={{ padding: 10 }}>
              <Button key={index} {...props} variant="outlined" color="primary">{value}</Button>
              <Typography variant="caption" component="p">
                {disclaimer}
              </Typography>
            </div>
          )
        })}
      </CardActions>
    </Card>
  );
}