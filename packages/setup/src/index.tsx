import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';

import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import CIDPage from './CIDPage';
import ConfigPage from './ConfigPage';
import FinalPage from './FinalPage';
import './styles/globals.css';


getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <WalletProvider {...chainOptions}>
      <Router>
        <Routes>
          <Route path="/" element={<CIDPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/complete" element={<FinalPage />} />
        </Routes>
      </Router>
    </WalletProvider>,
    document.getElementById('root'),
  );
});
