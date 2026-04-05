import {
  buildLichessProfileUrl,
  createLichessState,
  getLichessRatings,
  parseLichessState,
} from "../../src/services/lichess";

describe("lichess helpers", () => {
  test("extracts all available lichess ratings", () => {
    expect(
      getLichessRatings({
        id: "playerone",
        username: "PlayerOne",
        perfs: {
          classical: {
            rating: 2142,
            games: 300,
            rd: 55,
            prog: 12,
            prov: false,
            rank: 1800,
          },
          blitz: {
            rating: 2280,
            games: 1220,
            prov: true,
          },
          puzzle: {
            games: 40,
          },
        },
      })
    ).toEqual({
      classical: {
        rating: 2142,
        games: 300,
        rd: 55,
        prog: 12,
        prov: false,
        rank: 1800,
      },
      blitz: {
        rating: 2280,
        games: 1220,
        prov: true,
      },
    });
  });

  test("round-trips encoded oauth state", () => {
    const state = createLichessState({
      mode: "signup",
    });
    const parsed = parseLichessState(state);

    expect(parsed).not.toBeNull();
    expect(parsed?.mode).toBe("signup");
    expect(parsed?.nonce).toBeTruthy();
  });

  test("supports link mode in oauth state", () => {
    const state = createLichessState({
      mode: "link",
    });
    const parsed = parseLichessState(state);

    expect(parsed?.mode).toBe("link");
  });

  test("builds the public profile url", () => {
    expect(buildLichessProfileUrl("DrNykterstein")).toBe(
      "https://lichess.org/@/DrNykterstein"
    );
  });
});
