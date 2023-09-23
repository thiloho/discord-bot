{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs_20
        tree
      ];
      shellHook = ''
        alias reinit='node dbInit.js --force && node deploy-commands.js && node index.js'
      '';
    };
    packages.${system}.default = pkgs.buildNpmPackage {
      name = "build-denbot";
      src = ./.;
      npmDepsHash = "sha256-NRoyh++f5/NotnT6w59OtSYW2pKwJ04H32Ujy/adCNE=";
      dontNpmBuild = true;
      installPhase = ''
        mkdir $out
        cp -r * $out
      '';
    };
  };
}