import os
from P4 import P4
import subprocess
from ldclient.config import Config
import ldclient
from ldclient import Context

# LaunchDarkly credentials and feature flag key
LD_SDK_KEY = os.environ.get('LD_SDK_KEY')
LD_FLAG_KEY = 'push-to-remote'
flag_status = False

def initialize_ld():
    global flag_status
    ldclient.set_config(Config(LD_SDK_KEY))
    if ldclient.get().is_initialized():
        print("SDK successfully initialized!")
    else:
        print("SDK failed to initialize")
        exit()
    context = Context.builder('example-user-key').name('no-user').build()
    flag_status = ldclient.get().variation(LD_FLAG_KEY, context, False)
    if flag_status:
        print("Depots will be migrated to GitHub as the flag is enabled.")
    else:
        print("Depots will not be migrated to GitHub as the flag is disabled.")
    print(f"Push to remote: {flag_status}")

def clone_depots_to_git(p4):
    initialize_ld()
    default_depots = ["spec", "unload", "depot"]
    p4.connect()

    # Get all depots
    depots = p4.run_depots()
    depot_names = [depot['name'] for depot in depots]
    print(f"Found {len(depots) - 3} depots")

    try:
        for depot in depot_names:
            if depot in default_depots: continue

            git_folder = f"{depot}_git"
            print(f"Cloning {depot} to {git_folder}...")
            subprocess.run(["python3", "clone.py", "clone", f"//{depot}@all", git_folder])
            # if flag_status:
                # create_repo(depot, git_folder)
            print("<===================================================================>")
    finally:
        ldclient.get().close()
        p4.disconnect()

def list_permissions_for_all_depots(p4):
    try:
        p4.connect()

        # Get all depots
        depots = p4.run_depots()
        print(f"Found {len(depots) - 3} depots")
        csv_file = 'permissions.csv'
        depot_names = [depot['name'] for depot in depots]
        # save_permissions_csv(p4, depot_names, csv_file)
        # users, groups = get_users_and_groups(p4)
        print('Now cloning depots to git...')
        clone_depots_to_git(depot_names)
    finally:
        p4.disconnect()

if __name__ == "__main__":
    p4 = P4()
    p4.port = os.environ['PERFORCE_PORT']
    p4.user = os.environ['PERFORCE_USER']
    p4.password = os.environ['PERFORCE_PASSWORD']

    clone_depots_to_git(p4)
