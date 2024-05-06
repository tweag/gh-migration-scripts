import os
from P4 import P4
import json
import csv

default_depots = ["spec", "unload", "depot"]

def export_users_and_groups(p4):
    users_file = 'users.json'
    groups_file = 'groups.json'
    users = p4.run_users()
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=4)
    groups = p4.run_groups()
    with open(groups_file, 'w') as f:
        json.dump(groups, f, indent=4)

    return users, groups

def get_permissions(p4, depot, users):
    permissions = []
    protections = p4.run_protects(f"//{depot}/...")

    for protection in protections:
        permission = protection['perm']
        user = protection['user']
        if user in users:
            permissions.append({ "User": user, "Permission": permission })
        else:
            permissions.append({ "Group": user, "Permission": permission })
    return permissions

def save_permissions_csv(p4, depots, users, csv_file):
    with open(csv_file, 'w', newline='') as f:
        fieldnames = ['Depot', 'User', 'Group', 'Permission']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for depot in depots:
            if depot in default_depots: continue

            permissions = get_permissions(p4, depot, users)

            for permission in permissions:
                permission['Depot'] = depot
                writer.writerow(permission)

def save_group_members_csv(group_members, csv_file):
    with open(csv_file, 'w', newline='') as f:
        fieldnames = ['member', 'team', 'role']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for group_member in group_members:
            role = "maintainer" if group_member['isOwner'] == "1" else "member"
            writer.writerow({ "member": group_member['user'], "team": group_member['group'], "role": role })

def save_users_csv(users, csv_file):
    with open(csv_file, 'w', newline='') as f:
        fieldnames = ['login', 'full_name', 'email']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for user in users:
            writer.writerow({ "login": user['User'], "full_name": user['FullName'], "email": user['Email'] })

def save_groups_csv(groups, csv_file):
    with open(csv_file, 'w', newline='') as f:
        fieldnames = ['name', 'description', 'privacy', 'parentTeamId']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for group in groups:
            writer.writerow({ "name": group['Group'], "description": group['Description'], "privacy": "secret" })

def list_permissions_for_all_depots(p4):
    try:
        p4.connect()
        depots = p4.run_depots()
        print(f"Found {len(depots) - 3} depots")
        csv_file = 'permissions.csv'
        depot_names = [depot['name'] for depot in depots]
        print("Started exporting users and groups...")

        users, groups = export_users_and_groups(p4)
        save_users_csv(users, 'users.csv')
        save_groups_csv(groups, 'group_members.csv')
        users = list(map(lambda user: user['User'], users))
        save_group_members_csv(groups, 'group_members.csv')

        print("Finished exporting users and groups...")
        print("Now saving depot permissions for users and groups to csv...")
        save_permissions_csv(p4, depot_names, users, csv_file)
        print("Finished saving depot permissions for users and groups to csv...")
    finally:
        p4.disconnect()

if __name__ == "__main__":
    p4 = P4()
    p4.port = os.environ['PERFORCE_PORT']
    p4.user = os.environ['PERFORCE_USER']
    p4.password = os.environ['PERFORCE_PASSWORD']

    list_permissions_for_all_depots(p4)
