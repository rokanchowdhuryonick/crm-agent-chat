import { Chat } from './components/Chat';
import { Auth } from './components/Auth';
import './styles/main.css';

export const App = () => {
  return (
    <>
      <Auth />
      <Chat />
    </>
  );
};
