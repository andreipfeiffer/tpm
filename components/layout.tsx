type Props = {
  children: React.ReactNode;
};

export const Layout = (props: Props): JSX.Element => {
  const { children } = props;

  return (
    <>
      <nav></nav>
      <main>{children}</main>
      <footer></footer>
    </>
  );
};
