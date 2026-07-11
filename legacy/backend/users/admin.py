from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, APIKey

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('email', 'wallet_address', 'is_verified', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_verified')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Wallet Info', {'fields': ('wallet_address', 'sui_address')}),
        ('Verification', {'fields': ('is_verified', 'verification_level', 'quadrata_did')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Preferences', {'fields': ('notification_email', 'notification_push', 'language')}),
        ('Security', {'fields': ('mfa_enabled', 'mfa_secret', 'recovery_phrase')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'wallet_address')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_active', 'created_at', 'expires_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'user__email', 'key')
    readonly_fields = ('key', 'secret', 'created_at', 'last_used')

admin.site.register(User, UserAdmin)