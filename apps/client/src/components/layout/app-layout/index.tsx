type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout = (props: AppLayoutProps) => {
  const { children } = props;
  return (
    <>
      <nav className="fixed left-0 top-0 bottom-0 z-4 w-14 flex flex-col h-screen justify-between items-center py-6 bg-violet text-white"></nav>
      <div className="h-screen ml-14 py-4 px-12 bg-gray">{children}</div>
    </>
  );
};
