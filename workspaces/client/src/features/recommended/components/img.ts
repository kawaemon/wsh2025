// クエパラを消す
export function imgHack(s: string): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return s.split('?')[0]!;
}
