import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';

import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import App from './App';
import Config from './config';
import './styles/globals.css';


getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <WalletProvider {...chainOptions}>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/config" element={<Config />} />
        </Routes>
      </Router>
    </WalletProvider>,
    document.getElementById('root'),
  );
});
