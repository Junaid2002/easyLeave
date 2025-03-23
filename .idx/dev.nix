{# To learn more about how to use Nix to configure your environment
 # see: https://developers.google.com/idx/guides/customize-idx-env
 pkgs, ... }: {
  # Which nixpkgs channel to use
  channel = "stable-24.05"; # or "unstable" or any specific channel

  # Use https://search.nixos.org/packages to find packages.
  packages = [
    pkgs.nodejs-20_x
  ];

  # Sets environment variables in the workspace.
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id".
    extensions = [];

    # Enable previews.
    previews = {
      enable = true;
      previews = {
        web = {
          # Run "npm run dev" with PORT set to IDX's defined port for previews,
          # and show it in IDX's web preview panel.
          command = ["npm" "run" "vite"];
          manager = "web";
          env = {
            # Environment variables to set for your server
            PORT = "$PORT";
          };
        };
      };
    };
    # Workspace lifecycle hooks.
    workspace = {
      # Runs when a workspace is first created.
      onCreate = {
        # install JS dependencies from NPM.
        npm-install = "npm install && npm install --force";
      };
      # Runs when the workspace is (re)started.
      onStart = {
        # Add here background tasks
        # watch-backend = "npm run watch-backend"; 
      };
    };
  };
}
