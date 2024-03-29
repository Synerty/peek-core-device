"""Initial table creation

Peek Plugin Database Migration Script

Revision ID: d94277dd8aca
Revises: 
Create Date: 2017-06-25 14:53:23.543928

"""

# revision identifiers, used by Alembic.
revision = "d94277dd8aca"
down_revision = None
branch_labels = None
depends_on = None

import sqlalchemy as sa
from alembic import op


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "DeviceInfo",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=100), nullable=False),
        sa.Column("deviceId", sa.String(length=50), nullable=False),
        sa.Column("deviceType", sa.String(length=20), nullable=False),
        sa.Column("deviceToken", sa.String(length=50), nullable=False),
        sa.Column("appVersion", sa.String(length=15), nullable=False),
        sa.Column("updateVersion", sa.String(length=15), nullable=True),
        sa.Column("lastOnline", sa.DateTime(), nullable=True),
        sa.Column("lastUpdateCheck", sa.DateTime(), nullable=True),
        sa.Column("createdDate", sa.DateTime(), nullable=False),
        sa.Column("isOnline", sa.Boolean(), server_default="0", nullable=False),
        sa.Column("isEnrolled", sa.Boolean(), server_default="0",
            nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("description"),
        sa.UniqueConstraint("deviceId"),
        sa.UniqueConstraint("deviceToken"),
        schema="core_device",
    )
    op.create_table(
        "DeviceUpdate",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("deviceType", sa.String(length=20), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("buildDate", sa.DateTime(), nullable=False),
        sa.Column("appVersion", sa.String(length=15), nullable=False),
        sa.Column("updateVersion", sa.String(length=15), nullable=False),
        sa.Column("filePath", sa.String(length=150), nullable=False),
        sa.Column("urlPath", sa.String(length=150), nullable=False),
        sa.Column("isEnabled", sa.Boolean(), server_default="0",
            nullable=False),
        sa.PrimaryKeyConstraint("id"),
        schema="core_device",
    )
    op.create_index(
        "idx_DeviceUpdate_Version",
        "DeviceUpdate",
        ["deviceType", "appVersion", "updateVersion"],
        unique=True,
        schema="core_device",
    )
    op.create_table(
        "Setting",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema="core_device",
    )
    op.create_table(
        "SettingProperty",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("settingId", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=50), nullable=False),
        sa.Column("type", sa.String(length=16), nullable=True),
        sa.Column("int_value", sa.Integer(), nullable=True),
        sa.Column("char_value", sa.String(), nullable=True),
        sa.Column("boolean_value", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(
            ["settingId"],
            ["core_device.Setting.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="core_device",
    )
    op.create_index(
        "idx_SettingProperty_settingId",
        "SettingProperty",
        ["settingId"],
        unique=False,
        schema="core_device",
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(
        "idx_SettingProperty_settingId",
        table_name="SettingProperty",
        schema="core_device",
    )
    op.drop_table("SettingProperty", schema="core_device")
    op.drop_table("Setting", schema="core_device")
    op.drop_index(
        "idx_DeviceUpdate_Version", table_name="DeviceUpdate",
        schema="core_device"
    )
    op.drop_table("DeviceUpdate", schema="core_device")
    op.drop_table("DeviceInfo", schema="core_device")
    # ### end Alembic commands ###
