declare module '*.wasm' {
  const url: string;
  export default url;
}
declare module 'sql.js/dist/sql-wasm-browser.js' {
  import initSqlJs from 'sql.js';
  export default initSqlJs;
}
