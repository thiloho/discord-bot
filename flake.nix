{
  description = "JavaScript development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs = { self, nixpkgs }:
    let
      # Systems supported
      allSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      
      forAllSystems = f: nixpkgs.lib.genAttrs allSystems (system: f {
        pkgs = nixpkgs.legacyPackages.${system};
      });
    in
    {
      devShells = forAllSystems ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            tree
          ];
          shellHook = ''
            alias reinit='node dbInit.js --force && node deploy-commands.js && node index.js'
          '';
        };
      });
      packages = forAllSystems ({ pkgs }: {
        default = pkgs.buildNpmPackage {
          name = "build-denbot";
          src = ./.;
          npmDepsHash = "sha256-NRoyh++f5/NotnT6w59OtSYW2pKwJ04H32Ujy/adCNE=";
          dontNpmBuild = true;
          installPhase = ''
            mkdir $out
            cp -r * $out
          '';
        };
      });
    };
}