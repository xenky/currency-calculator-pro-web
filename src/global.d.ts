declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

interface ScreenOrientation {
  lock?(orientation: OrientationLockType): Promise<void>;
}
